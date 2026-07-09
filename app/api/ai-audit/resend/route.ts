import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidPaidAudit } from "@/lib/audit/token-verify";
import { generateFullReportPdf } from "@/lib/pdf/generate-report";
import { buildReportEmailHtml } from "@/lib/pdf/report-email";
import { createTransport } from "@/lib/email";
import { urlSchema } from "@/lib/validation/common";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const maxDuration = 120;

const bodySchema = z.object({
  token: z.string().min(1),
  url: urlSchema,
});

/** Re-sends the paid AI Readiness Report PDF to the email on file — reuses the cached reportData, never re-charges. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "ai-audit-resend"), { limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing token or url" }, { status: 400 });
  }
  const { token, url } = parsed.data;

  try {
    const paidAudit = await getValidPaidAudit(token, url);
    if (!paidAudit) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    if (!paidAudit.email) {
      return NextResponse.json({ error: "No email on file for this report" }, { status: 400 });
    }

    const { pdf, domain } = await generateFullReportPdf(paidAudit, url);
    await createTransport().sendMail({
      from: `SEOGenieAI <${env.SMTP_USER}>`,
      to: paidAudit.email,
      subject: `Your AI Readiness Report is ready — ${domain}`,
      html: buildReportEmailHtml(domain),
      attachments: [
        {
          filename: `ai-readiness-report-${domain.replace(/[^a-z0-9.-]/gi, "-")}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true, email: paidAudit.email });
  } catch (err) {
    logger.error("ai-audit resend failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to resend report" }, { status: 500 });
  }
}
