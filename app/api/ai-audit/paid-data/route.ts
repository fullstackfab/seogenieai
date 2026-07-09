import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidPaidAudit } from "@/lib/audit/token-verify";
import { getOrCreateReportData } from "@/lib/audit/report-data";
import { urlSchema } from "@/lib/validation/common";
import { logger } from "@/lib/logger";

export const maxDuration = 120;

const bodySchema = z.object({
  token: z.string().min(1),
  url: urlSchema,
});

/**
 * Paid report data: DA, backlinks, domain age, AI visibility + Claude fix
 * plan. Auth is the HMAC access token issued by the Stripe webhook.
 * Computed once per PaidAudit and cached — DataForSEO + Claude are the
 * expensive part of a report, so re-opening the same link must never
 * re-trigger them (see getOrCreateReportData).
 */
export async function POST(request: Request) {
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

    const { domain, domainAuthority, backlinks, domainAge, aiVisibility, fixPlan } =
      await getOrCreateReportData(paidAudit, url);

    return NextResponse.json({
      success: true,
      domain,
      domainAuthority,
      backlinks,
      domainAge,
      aiVisibility,
      fixPlan,
    });
  } catch (err) {
    logger.error("paid-data failed", { message: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "Failed to fetch paid data" }, { status: 500 });
  }
}
