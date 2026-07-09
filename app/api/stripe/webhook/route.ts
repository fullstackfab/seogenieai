import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { PaidAudit } from "@/models/PaidAudit";
import { generateAccessToken } from "@/lib/audit-token";
import { generateFullReportPdf } from "@/lib/pdf/generate-report";
import { buildReportEmailHtml } from "@/lib/pdf/report-email";
import { createTransport } from "@/lib/email";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const maxDuration = 300;

const TOKEN_TTL_DAYS = 7;

/**
 * checkout.session.completed → create PaidAudit (WITH accessToken/expiresAt —
 * the legacy webhook omitted them, so the online paid report never unlocked),
 * generate the PDF and email it.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig ?? "", env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error("Stripe webhook signature error", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });

  const session = event.data.object;
  if (session.payment_status !== "paid") return NextResponse.json({ received: true });

  const auditUrl = session.metadata?.audit_url;
  const customerEmail = session.metadata?.customer_email ?? session.customer_details?.email ?? null;
  if (!auditUrl) {
    logger.error("Stripe webhook missing audit_url metadata");
    return NextResponse.json({ received: true });
  }

  try {
    await dbConnect();

    // Idempotency guard — Stripe retries webhooks.
    const existing = await PaidAudit.findOne({ stripeSessionId: session.id });
    if (existing) return NextResponse.json({ received: true });

    const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    const paidAudit = await PaidAudit.create({
      stripeSessionId: session.id,
      auditUrl,
      email: customerEmail,
      status: "processing",
      accessToken: generateAccessToken(session.id, auditUrl),
      expiresAt,
    });
    logger.info("Payment recorded");

    if (!customerEmail) {
      await PaidAudit.updateOne(
        { stripeSessionId: session.id },
        { status: "failed", errorMessage: "No customer email on session" }
      );
      return NextResponse.json({ received: true });
    }

    try {
      await PaidAudit.updateOne({ stripeSessionId: session.id }, { status: "generating_pdf" });

      let pdf: Buffer | null = null;
      let domain = auditUrl;
      try {
        const result = await generateFullReportPdf(paidAudit, auditUrl);
        pdf = result.pdf;
        domain = result.domain;
      } catch (pdfErr) {
        logger.error("PDF generation failed", {
          message: pdfErr instanceof Error ? pdfErr.message : "unknown",
        });
      }

      await PaidAudit.updateOne({ stripeSessionId: session.id }, { status: "sending_email" });

      // Send the email even if the PDF failed (legacy behavior preserved).
      await createTransport().sendMail({
        from: `SEOGenieAI <${env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Your AI Readiness Report is ready — ${domain}`,
        html: buildReportEmailHtml(domain),
        ...(pdf
          ? {
              attachments: [
                {
                  filename: `ai-readiness-report-${domain.replace(/[^a-z0-9.-]/gi, "-")}.pdf`,
                  content: pdf,
                  contentType: "application/pdf",
                },
              ],
            }
          : {}),
      });
      await PaidAudit.updateOne({ stripeSessionId: session.id }, { status: "sent" });
      logger.info("Report email sent", { pdfAttached: !!pdf });
    } catch (pipelineErr) {
      const message = pipelineErr instanceof Error ? pipelineErr.message : "unknown";
      logger.error("PDF/email pipeline failed", { message });
      await PaidAudit.updateOne(
        { stripeSessionId: session.id },
        { status: "failed", errorMessage: message }
      );
    }
  } catch (err) {
    logger.error("Stripe webhook error", {
      message: err instanceof Error ? err.message : "unknown",
    });
    // 200 so Stripe doesn't retry forever — the PaidAudit record is saved.
  }

  return NextResponse.json({ received: true });
}
