import "server-only";
import { checkDns, checkRobotsTxt, checkSitemap, fetchHtml, normalizeUrl } from "@/lib/audit/fetchers";
import { parseHtmlSignals } from "@/lib/audit/html-signals";
import { buildFreeChecks } from "@/lib/audit/free-checks";
import { buildLockedChecks } from "@/lib/audit/locked-checks";
import { extractDomain } from "@/lib/validation/common";
import type { AuditCheck } from "@/lib/audit/types";

const SCORED_KEYS = [
  "https",
  "title",
  "metaDescription",
  "robotsTxt",
  "sitemap",
  "h1",
  "openGraph",
  "twitterCard",
  "viewport",
  "dnsHardening",
  "jsonLd",
  "htmlLang",
  "ogLocale",
  "sameAs",
  "canonical",
  "hreflang",
  "metaRobots",
  "aiRobots",
  "aiContentRestrictions",
];

export function calculateScore(audit: Record<string, AuditCheck>): number {
  let passed = 0;
  let total = 0;
  for (const key of SCORED_KEYS) {
    const item = audit[key];
    if (!item || item.status === "info") continue;
    total++;
    if (item.status === "pass") passed++;
  }
  return Math.round((passed / total) * 100);
}

/**
 * The 19-check AI-readiness audit. Single source of truth — the legacy app
 * had this duplicated between lib/auditEngine.js and the route handler.
 */
export async function runFullAudit(rawUrl: string) {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error("Invalid URL");
  const domain = extractDomain(url);

  const [html, robots, dns] = await Promise.all([
    fetchHtml(url),
    checkRobotsTxt(url),
    checkDns(domain),
  ]);
  const sitemap = await checkSitemap(url, robots.raw ?? null);

  const signals = parseHtmlSignals(html);
  const audit: Record<string, AuditCheck> = {
    ...buildFreeChecks(url, signals, robots, sitemap),
    ...buildLockedChecks(signals, robots, dns),
  };

  return {
    success: true as const,
    url,
    domain,
    score: calculateScore(audit),
    audit: { url, generatedAt: new Date().toISOString(), isPaid: false, ...audit },
  };
}
