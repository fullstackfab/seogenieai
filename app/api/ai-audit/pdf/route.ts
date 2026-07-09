import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidPaidAudit } from "@/lib/audit/token-verify";
import { generateFullReportPdf } from "@/lib/pdf/generate-report";
import { urlSchema } from "@/lib/validation/common";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const maxDuration = 120;

const bodySchema = z.object({
  token: z.string().min(1),
  url: urlSchema,
});

/** Downloads the paid AI Readiness Report as a PDF — reuses the cached reportData, never re-triggers DataForSEO/Claude. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "ai-audit-pdf"), { limit: 10, windowMs: 60_000 });
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

    const { pdf, domain } = await generateFullReportPdf(paidAudit, url);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ai-readiness-report-${domain.replace(/[^a-z0-9.-]/gi, "-") || "report"}.pdf"`,
      },
    });
  } catch (err) {
    logger.error("ai-audit PDF generation failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
