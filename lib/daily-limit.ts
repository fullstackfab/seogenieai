import "server-only";
import { dbConnect } from "@/lib/db";
import { DailyUsage } from "@/models/DailyUsage";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Persistent per-IP daily cap for cost-bearing free features — unlike
 * lib/rate-limit.ts's in-memory limiter, this survives serverless cold
 * starts/multiple instances, which a 24h window actually needs to hold.
 * Atomically increments first, then checks — a request that pushes the
 * count over the limit is rejected but still counted (fine for abuse
 * damping; we don't need exact "successful use" accounting).
 */
export async function checkDailyLimit(
  feature: string,
  ip: string,
  limit: number
): Promise<{ ok: boolean; count: number }> {
  await dbConnect();
  const date = todayUtc();
  const key = `${feature}:${ip}`;
  const doc = await DailyUsage.findOneAndUpdate(
    { key, date },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );
  return { ok: doc.count <= limit, count: doc.count };
}
