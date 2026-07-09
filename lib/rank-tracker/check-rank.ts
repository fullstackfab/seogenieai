import "server-only";
import { endpoints, toDomain } from "@/lib/dataforseo/endpoints";
import { fetchDataForSeo } from "@/lib/dataforseo/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

/** Truncates to midnight UTC — the day boundary RankSnapshot rows are keyed on. */
export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** One keyword's current Google position for a domain — shared by the initial post-purchase check and the daily cron. */
export async function checkKeywordRank(params: {
  keyword: string;
  domain: string;
  locationCode?: number;
  languageCode?: string;
}): Promise<{ position: number | null; url: string | null }> {
  const req = endpoints.rankCheck(params);
  const result = await fetchDataForSeo<Loose>(req.path, req.body, req.timeoutMs);
  const items: Loose[] = result?.items ?? [];
  const target = toDomain(params.domain);
  const match = items.find((it) => it.domain && String(it.domain).includes(target));
  return { position: match?.rank_absolute ?? null, url: match?.url ?? null };
}
