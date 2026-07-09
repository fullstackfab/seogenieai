import { NextResponse } from "next/server";
import { z } from "zod";
import { endpoints } from "@/lib/dataforseo/endpoints";
import { fetchDataForSeo } from "@/lib/dataforseo/client";
import { normalizeKeywordSuggestions } from "@/lib/dataforseo/normalize";
import { rateLimit, clientKey, clientIp } from "@/lib/rate-limit";
import { checkDailyLimit } from "@/lib/daily-limit";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const KEYWORD_PLANNER_DAILY_LIMIT = 2;

const bodySchema = z.object({
  keyword: z.string().trim().min(1).max(1000),
  language: z.string().max(60).optional(),
  location: z.string().max(100).optional(),
});

// Bounds how many seed keywords one request fans out to DataForSEO, so a
// large paste can't trigger an unbounded burst of parallel upstream calls.
const MAX_SEED_KEYWORDS = 25;

/** UI lets users add several keyword tags; DataForSEO's keyword_suggestions
 * endpoint only accepts one seed keyword per call, so we split on commas and
 * fan out a call per keyword rather than sending the joined string as one
 * (invalid) seed phrase. */
function splitKeywords(raw: string): string[] {
  const parts = Array.from(
    new Set(
      raw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    )
  );
  return (parts.length > 0 ? parts : [raw.trim()]).slice(0, MAX_SEED_KEYWORDS);
}

/** DataForSEO Labs keyword suggestions, normalized to the shape KeywordAnalyticsTable expects. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "keywords"), { limit: 20, windowMs: 60_000 });
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

  // Free but still spends real DataForSEO calls per search — cap it at 2 per IP per UTC day.
  const daily = await checkDailyLimit("keyword-planner", clientIp(request), KEYWORD_PLANNER_DAILY_LIMIT);
  if (!daily.ok) {
    return NextResponse.json(
      { error: "You've used today's 2 free searches for Keyword Planner. Please try again tomorrow." },
      { status: 429 }
    );
  }

  const seedKeywords = splitKeywords(parsed.data.keyword);
  const settled = await Promise.allSettled(
    seedKeywords.map(async (keyword) => {
      const req = endpoints.keywordSuggestions({ ...parsed.data, keyword });
      const result = await fetchDataForSeo(req.path, req.body, req.timeoutMs);
      return normalizeKeywordSuggestions(result);
    })
  );
  const failures = settled.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
  if (failures.length > 0) {
    logger.error("Keyword suggestions failed", {
      failedCount: failures.length,
      of: seedKeywords.length,
      messages: failures.map((f) => (f.reason instanceof Error ? f.reason.message : "unknown")),
    });
  }

  // Only fail the whole request if every seed keyword failed.
  if (failures.length === settled.length) {
    return NextResponse.json(
      { success: false, error: "Keyword suggestions failed" },
      { status: 502 }
    );
  }

  const seen = new Set<string>();
  const data = settled
    .filter(
      (r): r is PromiseFulfilledResult<ReturnType<typeof normalizeKeywordSuggestions>> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => r.value)
    .filter((item) => {
      if (!item.keyword || seen.has(item.keyword)) return false;
      seen.add(item.keyword);
      return true;
    });

  return NextResponse.json({ success: true, data });
}
