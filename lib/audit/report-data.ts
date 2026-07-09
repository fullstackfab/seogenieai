import "server-only";
import type { HydratedDocument } from "mongoose";
import { PaidAudit, type PaidAuditDoc } from "@/models/PaidAudit";
import { runFullAudit } from "@/lib/audit/engine";
import { runFullPaidData } from "@/lib/audit/paid-data";
import { generateFixPlan } from "@/lib/audit/fix-plan";
import { logger } from "@/lib/logger";
import type { AuditCheck, FixPlanItem } from "@/lib/audit/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

export type ReportData = {
  domain: string;
  score: number;
  audit: Record<string, AuditCheck>;
  domainAuthority: Loose;
  backlinks: Loose;
  domainAge: Loose;
  aiVisibility: Loose;
  fixPlan: FixPlanItem[];
};

/**
 * Computes the full paid report (19-check audit + DA/backlinks/domain age/AI
 * visibility + Claude fix plan) once per PaidAudit and persists it. Both the
 * webhook (PDF) and the on-page report call this — whichever runs first
 * computes and saves; every later open reads the saved copy instead of
 * re-triggering paid DataForSEO/Claude calls.
 */
export async function getOrCreateReportData(
  paidAudit: HydratedDocument<PaidAuditDoc>,
  url: string
): Promise<ReportData> {
  if (paidAudit.reportData) return paidAudit.reportData as ReportData;

  const auditResult = await runFullAudit(url);
  const paid = await runFullPaidData(url);
  const fixPlan = await generateFixPlan(
    auditResult.audit as unknown as Record<string, AuditCheck>,
    paid.domainAuthority?.domainAuthority
  );

  const reportData: ReportData = {
    domain: auditResult.domain,
    score: auditResult.score,
    audit: auditResult.audit as unknown as Record<string, AuditCheck>,
    domainAuthority: paid.domainAuthority,
    backlinks: paid.backlinks,
    domainAge: paid.domainAge,
    aiVisibility: paid.aiVisibility,
    fixPlan,
  };

  await PaidAudit.updateOne({ _id: paidAudit._id }, { reportData });
  logger.info("Report data computed and cached", { paidAuditId: String(paidAudit._id) });
  return reportData;
}
