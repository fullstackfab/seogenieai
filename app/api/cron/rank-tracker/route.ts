import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { RankTrackerPack } from "@/models/RankTrackerPack";
import { RankSnapshot } from "@/models/RankSnapshot";
import { checkKeywordRank, startOfUtcDay } from "@/lib/rank-tracker/check-rank";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const maxDuration = 300;

// Small gap between DataForSEO calls — this runs server-to-server on a
// schedule, not on behalf of a waiting user, so it must not share the
// user-facing /api/seo/* rate-limit bucket, but should still be polite to
// the upstream API.
const DELAY_BETWEEN_CHECKS_MS = 300;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Daily rank check for every active pack. Triggered by Vercel Cron
 * (vercel.json) — Vercel automatically sends `Authorization: Bearer
 * $CRON_SECRET` on its own invocations once that env var is set.
 * Idempotent: a keyword already snapshotted today is skipped, so reruns or
 * a delayed/retried invocation never double-charge a DataForSEO call.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const today = startOfUtcDay(new Date());
  const packs = await RankTrackerPack.find({ expiresAt: { $gt: new Date() } }).lean();

  let checked = 0;
  let skipped = 0;
  let failed = 0;

  for (const pack of packs) {
    for (const keyword of pack.keywords) {
      const existing = await RankSnapshot.findOne({ packId: pack._id, keyword, date: today }).lean();
      if (existing) {
        skipped++;
        continue;
      }
      try {
        const { position, url } = await checkKeywordRank({
          keyword,
          domain: pack.domain,
          locationCode: pack.locationCode,
          languageCode: pack.languageCode,
        });
        await RankSnapshot.updateOne(
          { packId: pack._id, keyword, date: today },
          { $set: { position, url, checkedAt: new Date() } },
          { upsert: true }
        );
        checked++;
      } catch (err) {
        failed++;
        logger.error("Rank Tracker cron check failed", {
          packId: String(pack._id),
          keyword,
          message: err instanceof Error ? err.message : "unknown",
        });
      }
      await sleep(DELAY_BETWEEN_CHECKS_MS);
    }
  }

  logger.info("Rank Tracker cron run complete", { packs: packs.length, checked, skipped, failed });
  return NextResponse.json({ success: true, packs: packs.length, checked, skipped, failed });
}
