import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { PaidAnalyticsReport } from "@/models/PaidAnalyticsReport";
import { domainSchema } from "@/lib/validation/common";
import { isSameOrigin } from "@/lib/csrf";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { renderPdf } from "@/lib/pdf/render";
import { buildAnalyticsReportHtml } from "@/lib/pdf/build-analytics-report-html";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const bodySchema = z.object({ domain: domainSchema });

/** Renders the user's own cached AI Growth Report as a downloadable PDF — ownership via session, not a client-supplied blob. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request, "analytics-pdf"), { limit: 10, windowMs: 60_000 });
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
  const { domain } = parsed.data;

  try {
    await dbConnect();
    const report = await PaidAnalyticsReport.findOne({
      userEmail: session.user.email,
      domain,
    }).lean();
    if (!report?.reportHtml) {
      return NextResponse.json({ error: "No report found for this domain" }, { status: 404 });
    }

    const pdf = await renderPdf(buildAnalyticsReportHtml({ domain, html: report.reportHtml }));
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ai-growth-report-${domain.replace(/[^a-z0-9.-]/gi, "-") || "report"}.pdf"`,
      },
    });
  } catch (err) {
    logger.error("Analytics PDF generation failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
