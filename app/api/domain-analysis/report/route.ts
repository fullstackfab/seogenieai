import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getAnthropic, CLAUDE_MODEL } from "@/lib/anthropic/client";
import { buildAnalyticsAiReportPrompt } from "@/lib/anthropic/prompts";
import { getStripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { PaidAnalyticsReport } from "@/models/PaidAnalyticsReport";
import { domainSchema } from "@/lib/validation/common";
import { isSameOrigin } from "@/lib/csrf";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { renderPdf } from "@/lib/pdf/render";
import { buildAnalyticsReportHtml } from "@/lib/pdf/build-analytics-report-html";
import { buildAnalyticsReportEmailHtml } from "@/lib/pdf/analytics-report-email";
import { createTransport } from "@/lib/email";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const maxDuration = 120;

const MAX_ANALYTICS_JSON_LENGTH = 200_000;

const bodySchema = z.object({
  domain: domainSchema,
  stripeSessionId: z.string().trim().min(1).max(255),
  googleResponse: z.unknown(),
});

/** Cached lookup — does this user already have a paid report for this domain? */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const domain = new URL(request.url).searchParams.get("domain")?.trim();
  if (!domain) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  try {
    await dbConnect();
    const existing = await PaidAnalyticsReport.findOne({
      userEmail: session.user.email,
      domain,
    }).lean();
    return NextResponse.json({ unlocked: !!existing?.reportHtml, html: existing?.reportHtml ?? null });
  } catch (err) {
    logger.error("Analytics report lookup failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to look up report" }, { status: 500 });
  }
}

/**
 * Generates (once) and caches the paid AI Growth Report. If a cached report
 * already exists for this user+domain it is returned immediately — no Claude
 * call, no re-charge. Email delivery to the user's account is automatic.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userEmail = session.user.email;

  const limit = rateLimit(clientKey(request, "analytics-report"), { limit: 5, windowMs: 60_000 });
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
  const { domain, stripeSessionId, googleResponse } = parsed.data;

  const analyticsJson = JSON.stringify(googleResponse ?? {});
  if (analyticsJson.length > MAX_ANALYTICS_JSON_LENGTH) {
    return NextResponse.json({ error: "Analytics payload too large" }, { status: 400 });
  }

  try {
    await dbConnect();

    // Already generated for this user+domain — never re-charge or re-generate.
    const existing = await PaidAnalyticsReport.findOne({ userEmail, domain }).lean();
    if (existing?.reportHtml) {
      return NextResponse.json({ success: true, html: existing.reportHtml, cached: true });
    }

    // Defense in depth — the client already went through /api/stripe/analytics-verify.
    const checkoutSession = await getStripe().checkout.sessions.retrieve(stripeSessionId);
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }
    if (checkoutSession.metadata?.userEmail !== userEmail || checkoutSession.metadata?.domain !== domain) {
      return NextResponse.json({ error: "This session does not belong to your account" }, { status: 403 });
    }

    const response = await getAnthropic().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: buildAnalyticsAiReportPrompt(analyticsJson, domain) }],
    });

    if (response.stop_reason === "max_tokens") {
      logger.warn("Analytics AI report hit max_tokens", { domain, userEmail });
    }

    const rawText = response.content
      .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
      .map((block) => block.text)
      .join("");
    const reportHtml = sanitizeHtml(rawText);

    await PaidAnalyticsReport.updateOne(
      { userEmail, domain },
      { $set: { stripeSessionId, reportHtml, emailStatus: "pending" } },
      { upsert: true }
    );

    try {
      const pdf = await renderPdf(buildAnalyticsReportHtml({ domain, html: reportHtml }));
      await createTransport().sendMail({
        from: `SEOGenieAI <${env.SMTP_USER}>`,
        to: userEmail,
        subject: `Your AI Growth Report is ready — ${domain}`,
        html: buildAnalyticsReportEmailHtml(domain),
        attachments: [
          {
            filename: `ai-growth-report-${domain.replace(/[^a-z0-9.-]/gi, "-")}.pdf`,
            content: pdf,
            contentType: "application/pdf",
          },
        ],
      });
      await PaidAnalyticsReport.updateOne({ userEmail, domain }, { $set: { emailStatus: "sent" } });
    } catch (emailErr) {
      logger.error("Analytics report email delivery failed", {
        message: emailErr instanceof Error ? emailErr.message : "unknown",
      });
      await PaidAnalyticsReport.updateOne({ userEmail, domain }, { $set: { emailStatus: "failed" } }).catch(
        () => {}
      );
    }

    return NextResponse.json({ success: true, html: reportHtml, cached: false });
  } catch (err) {
    logger.error("Analytics report generation failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
