import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { PaidInsight } from "@/models/PaidInsight";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { renderPdf } from "@/lib/pdf/render";
import { buildInsightReportHtml } from "@/lib/pdf/build-insight-report-html";
import { buildInsightReportEmailHtml } from "@/lib/pdf/insight-report-email";
import { createTransport } from "@/lib/email";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const bodySchema = z.object({
  html: z.string().trim().min(1).max(200_000),
  domain: z.string().trim().max(253),
  email: z.string().trim().email(),
  stripeSessionId: z.string().trim().min(1).max(255),
});

/**
 * Saves the paid PageSpeed AI report and emails it as a PDF — the durable
 * copy the on-page unlock (session-only) doesn't provide.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "insight-email"), { limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 }
    );
  }
  const { html, domain, email, stripeSessionId } = parsed.data;

  try {
    const session = await getStripe().checkout.sessions.retrieve(stripeSessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }
  } catch (err) {
    logger.error("Insight email payment verification failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 402 });
  }

  try {
    await dbConnect();

    // Idempotency guard — the client may retry (e.g. a re-opened modal).
    const existing = await PaidInsight.findOne({ stripeSessionId }).lean();
    if (existing?.emailStatus === "sent") {
      return NextResponse.json({ success: true, alreadySent: true });
    }

    await PaidInsight.updateOne(
      { stripeSessionId },
      { $set: { domain, email, html, emailStatus: "pending" } },
      { upsert: true }
    );

    const pdf = await renderPdf(buildInsightReportHtml({ domain, html }));
    await createTransport().sendMail({
      from: `SEOGenieAI <${env.SMTP_USER}>`,
      to: email,
      subject: `Your PageSpeed AI Report is ready — ${domain}`,
      html: buildInsightReportEmailHtml(domain),
      attachments: [
        {
          filename: `pagespeed-ai-report-${domain.replace(/[^a-z0-9.-]/gi, "-")}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    await PaidInsight.updateOne({ stripeSessionId }, { $set: { emailStatus: "sent" } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Insight email delivery failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    await PaidInsight.updateOne({ stripeSessionId }, { $set: { emailStatus: "failed" } }).catch(
      () => {}
    );
    return NextResponse.json({ error: "Failed to email report" }, { status: 500 });
  }
}
