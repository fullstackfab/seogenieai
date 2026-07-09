import "server-only";
import type { HydratedDocument } from "mongoose";
import type { PaidAuditDoc } from "@/models/PaidAudit";
import { getOrCreateReportData } from "@/lib/audit/report-data";
import { buildReportHtml } from "@/lib/pdf/build-html";
import { renderPdf } from "@/lib/pdf/render";

/**
 * Full paid-report pipeline: 19-check audit → paid data → Claude fix plan →
 * Puppeteer PDF. Called directly by the Stripe webhook (the legacy app made
 * an HTTP round-trip to its own /api/ai-audit/pdf route, which was also
 * publicly callable — that free-PDF hole is closed by keeping this lib-only).
 * Reuses getOrCreateReportData so the PDF and the on-page report never
 * trigger DataForSEO/Claude twice for the same payment.
 */
export async function generateFullReportPdf(
  paidAudit: HydratedDocument<PaidAuditDoc>,
  url: string
): Promise<{ pdf: Buffer; domain: string }> {
  const reportData = await getOrCreateReportData(paidAudit, url);

  const html = buildReportHtml({
    auditResult: { url, domain: reportData.domain, score: reportData.score, audit: reportData.audit },
    paidData: {
      domainAuthority: reportData.domainAuthority,
      backlinks: reportData.backlinks,
      domainAge: reportData.domainAge,
      aiVisibility: reportData.aiVisibility,
      fixPlan: reportData.fixPlan,
    },
  });

  return { pdf: await renderPdf(html), domain: reportData.domain };
}
