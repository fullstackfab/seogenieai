import "server-only";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

function firstItem(result: Loose): Loose {
  return result?.items?.[0] ?? result;
}

export function normalizeTraffic(result: Loose) {
  const item = firstItem(result);
  const organic = item?.metrics?.organic ?? {};
  const paid = item?.metrics?.paid ?? {};
  return {
    organicTraffic: organic.etv ?? null,
    paidTraffic: paid.etv ?? null,
    paidTrafficCost: paid.estimated_paid_traffic_cost ?? organic.estimated_paid_traffic_cost ?? null,
  };
}

export function normalizeTrafficHistory(result: Loose) {
  const items: Loose[] = result?.items ?? [];
  return items.map((it) => ({
    period: it.year && it.month ? `${it.year}-${String(it.month).padStart(2, "0")}` : "—",
    organicTraffic: it.metrics?.organic?.etv ?? null,
    paidTraffic: it.metrics?.paid?.etv ?? null,
  }));
}

/** DataForSEO has no "Domain Authority" metric — `rank` (0-1000) is the closest analogue, scaled to 0-100. */
export function normalizeDomainAuthority(result: Loose) {
  const rank = result?.rank;
  return {
    domain: result?.target ?? null,
    domainAuthority: typeof rank === "number" ? Math.round(rank / 10) : null,
  };
}

export function normalizeBacklinks(result: Loose) {
  const totalBacklinks: number | null = result?.backlinks ?? null;
  // DataForSEO has no "dofollow" attribute (only nofollow/noopener/noreferrer/external/
  // sponsored/ugc) — approximate dofollow as total minus nofollow, the standard convention.
  const nofollowLinks: number | null = result?.referring_links_attributes?.nofollow ?? null;
  const dofollowLinks =
    typeof totalBacklinks === "number" && typeof nofollowLinks === "number"
      ? Math.max(totalBacklinks - nofollowLinks, 0)
      : null;
  const tld = result?.referring_links_tld ?? {};

  return {
    totalBacklinks,
    referringDomains: result?.referring_domains ?? null,
    referringPages: result?.referring_pages ?? null,
    referringIPs: result?.referring_ips ?? null,
    // "Indexed pages" isn't a DataForSEO metric — crawled_pages is the real analogue.
    crawledPages: result?.crawled_pages ?? null,
    brokenBacklinks: result?.broken_backlinks ?? null,
    spamScore: result?.backlinks_spam_score ?? null,
    domainAuthority: typeof result?.rank === "number" ? Math.round(result.rank / 10) : null,
    dofollowLinks,
    nofollowLinks,
    governmentLinks: tld.gov ?? null,
    eduLinks: tld.edu ?? null,
    tldDistribution: tld,
    linkAttributes: result?.referring_links_types ?? {},
  };
}

export function normalizeDomainAge(result: Loose) {
  const item = firstItem(result);
  return {
    registrationDate: item?.created_datetime ?? null,
    changeDate: item?.changed_datetime ?? null,
    lastUpdate: item?.updated_datetime ?? null,
    expiryDate: item?.expiration_datetime ?? null,
    registrar: item?.registrar ?? null,
  };
}

export function normalizeCompetitors(result: Loose) {
  const items: Loose[] = result?.items ?? [];
  return items.map((c) => ({
    domain: c.domain ?? null,
    organicTraffic: c.metrics?.organic?.etv ?? c.full_domain_metrics?.organic?.etv ?? null,
    commonKeywords: c.intersections ?? null,
  }));
}

export function normalizeKeywordSuggestions(result: Loose) {
  const items: Loose[] = result?.items ?? [];
  return items.map((it) => ({
    keyword: it.keyword,
    search_intent: it.search_intent_info?.main_intent ?? undefined,
    avg_search_volume: it.keyword_info?.search_volume ?? undefined,
    cpc: it.keyword_info?.cpc ?? undefined,
    competition_level: it.keyword_info?.competition_level ?? undefined,
    low_top_of_page_bid: it.keyword_info?.low_top_of_page_bid ?? undefined,
    high_top_of_page_bid: it.keyword_info?.high_top_of_page_bid ?? undefined,
    search_volume_trend: it.keyword_info?.search_volume_trend ?? undefined,
    keyword_difficulty: it.keyword_properties?.keyword_difficulty ?? undefined,
    serp_statistics: { se_results_count: it.serp_info?.se_results_count },
    monthly_searches: it.keyword_info?.monthly_searches ?? [],
  }));
}

/** Best-effort extraction of the model's answer text from an ai_optimization/*\/llm_responses/live result. */
function extractLlmText(result: Loose): string {
  const items: Loose[] = result?.items ?? [];
  for (const item of items) {
    const sections = item?.sections ?? item?.message?.sections ?? [];
    for (const section of sections) {
      if (typeof section?.text === "string" && section.text.trim()) return section.text;
    }
  }
  return typeof result?.content === "string" ? result.content : "";
}

/** Parses the JSON brand-visibility object our prompt asks the model to return. */
export function parseAiVisibility(result: Loose): Loose | null {
  const text = extractLlmText(result);
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { brandDescription: cleaned.slice(0, 500) };
  }
}
