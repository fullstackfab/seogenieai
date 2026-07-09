import "server-only";
import { countryIsoToLocationCode } from "@/lib/location-map";

const US_LOCATION_CODE = 2840; // United States
const DEFAULT_LANGUAGE = "en";

/** A handful of major markets used to approximate a per-country traffic split
 * (DataForSEO, unlike the legacy provider, has no single "traffic by country"
 * endpoint — this fans out domain_rank_overview across a few location codes). */
export const TRAFFIC_COUNTRIES = [
  { name: "United States", code: 2840 },
  { name: "United Kingdom", code: 2826 },
  { name: "India", code: 2356 },
  { name: "Canada", code: 2124 },
  { name: "Australia", code: 2036 },
  { name: "Germany", code: 2276 },
];

export type DfsRequest = { path: string; body: Record<string, unknown>; timeoutMs?: number };

/** Strips a URL down to a bare domain ("https://www.example.co.uk/x" → "example.co.uk"). */
export function toDomain(url: string): string {
  try {
    const withProto = url.includes("://") ? url : `https://${url}`;
    return new URL(withProto).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function aiVisibilityPrompt(brand: string): string {
  return [
    `Answer strictly as JSON (no markdown fences, no commentary) matching this schema:`,
    `{"brandName": string, "brandDescription": string, "companyUrl": string|null,`,
    ` "brandAwareness": "High"|"Medium"|"Low"|"Unknown", "sentiment": "Positive"|"Neutral"|"Negative",`,
    ` "credibility": string, "topTopics": string[], "topCompetitors": string[],`,
    ` "relatedPrompts": string[], "servicesProducts": string[]}`,
    `Analyze the brand/domain "${brand}". "topTopics" are up to 6 topics you associate with the brand,`,
    `"topCompetitors" are up to 5 competing brands, "relatedPrompts" are up to 5 example user questions`,
    `that would surface this brand in a response, "servicesProducts" are up to 6 products/services it offers.`,
  ].join(" ");
}

/** Request builders for every DataForSEO endpoint this app calls. */
export const endpoints = {
  websiteTraffic: (p: { domain: string }): DfsRequest => ({
    path: "dataforseo_labs/google/domain_rank_overview/live",
    body: { target: toDomain(p.domain), location_code: US_LOCATION_CODE, language_code: DEFAULT_LANGUAGE },
  }),
  websiteTrafficForCountry: (p: { domain: string; locationCode: number }): DfsRequest => ({
    path: "dataforseo_labs/google/domain_rank_overview/live",
    body: { target: toDomain(p.domain), location_code: p.locationCode, language_code: DEFAULT_LANGUAGE },
  }),
  websiteTrafficHistory: (p: { domain: string }): DfsRequest => ({
    path: "dataforseo_labs/google/historical_rank_overview/live",
    body: { target: toDomain(p.domain), location_code: US_LOCATION_CODE, language_code: DEFAULT_LANGUAGE },
  }),
  backlinkSummary: (p: { domain: string }): DfsRequest => ({
    path: "backlinks/summary/live",
    body: { target: toDomain(p.domain), include_subdomains: true },
  }),
  domainAge: (p: { domain: string }): DfsRequest => ({
    path: "domain_analytics/whois/overview/live",
    body: { filters: [["domain", "=", toDomain(p.domain)]] },
  }),
  serpChecker: (p: { keyword: string; domain: string; country?: string }): DfsRequest => ({
    path: "serp/google/organic/live/advanced",
    body: {
      keyword: p.keyword,
      location_code: US_LOCATION_CODE,
      language_code: DEFAULT_LANGUAGE,
      device: "desktop",
      depth: 100,
    },
  }),
  /**
   * Rank Tracker's daily check — depth 30 (3 pricing units, $0.006/check at
   * DataForSEO's live rate) instead of serpChecker's depth 100 (10 units,
   * $0.02/check). Top-30 covers the vast majority of rank-tracking use and
   * keeps this on the simple synchronous live endpoint rather than needing
   * the async task_post/tasks_ready/task_get queue for the same cost.
   */
  rankCheck: (p: { keyword: string; domain: string; locationCode?: number; languageCode?: string }): DfsRequest => ({
    path: "serp/google/organic/live/advanced",
    body: {
      keyword: p.keyword,
      location_code: p.locationCode ?? US_LOCATION_CODE,
      language_code: p.languageCode ?? DEFAULT_LANGUAGE,
      device: "desktop",
      depth: 30,
    },
  }),
  serpAnalyzer: (p: { keyword: string; country?: string }): DfsRequest => ({
    path: "serp/google/organic/live/advanced",
    body: {
      keyword: p.keyword,
      location_code: US_LOCATION_CODE,
      language_code: DEFAULT_LANGUAGE,
      device: "desktop",
      depth: 20,
    },
  }),
  competitorAnalysis: (p: { domain: string }): DfsRequest => ({
    path: "dataforseo_labs/google/competitors_domain/live",
    body: {
      target: toDomain(p.domain),
      location_code: US_LOCATION_CODE,
      language_code: DEFAULT_LANGUAGE,
      limit: 20,
    },
  }),
  /** `p.location` is an ISO 3166-1 alpha-2 country code (e.g. "US"), converted
   * to DataForSEO's numeric location_code — falls back to the US if the
   * country can't be resolved rather than sending a raw location_name, which
   * DataForSEO rejects unless it matches their locations list exactly. */
  keywordSuggestions: (p: { keyword: string; language?: string; location?: string }): DfsRequest => ({
    path: "dataforseo_labs/google/keyword_suggestions/live",
    body: {
      keyword: p.keyword,
      location_code: (p.location && countryIsoToLocationCode(p.location)) || US_LOCATION_CODE,
      language_code: DEFAULT_LANGUAGE,
      limit: 50,
      include_serp_info: true,
    },
    timeoutMs: 30_000,
  }),
  aiVisibilityChatgpt: (p: { brand: string }): DfsRequest => ({
    path: "ai_optimization/chat_gpt/llm_responses/live",
    body: { user_prompt: aiVisibilityPrompt(p.brand), model_name: "gpt-4.1-mini", web_search: true },
    timeoutMs: 60_000,
  }),
  aiVisibilityGemini: (p: { brand: string }): DfsRequest => ({
    path: "ai_optimization/gemini/llm_responses/live",
    body: { user_prompt: aiVisibilityPrompt(p.brand), model_name: "gemini-2.0-flash", web_search: true },
    timeoutMs: 60_000,
  }),
  aiVisibilityPerplexity: (p: { brand: string }): DfsRequest => ({
    path: "ai_optimization/perplexity/llm_responses/live",
    body: { user_prompt: aiVisibilityPrompt(p.brand), model_name: "sonar", web_search: true },
    timeoutMs: 60_000,
  }),
};
