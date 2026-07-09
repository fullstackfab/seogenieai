import "server-only";
import {
  checkDns,
  checkRedirects,
  checkRobotsTxt,
  checkSitemap,
  checkSoft404,
  checkSslCertificate,
  checkWellKnown,
  fetchPage,
  normalizeUrl,
} from "@/lib/audit/fetchers";
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
  "headings",
  "imageAlt",
  "favicon",
  "mixedContent",
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
  "llmsTxt",
  "sslCertificate",
  "httpHeaders",
  "redirectConsistency",
  "soft404",
  "sitemapHealth",
  "linkHygiene",
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
 * The AI-readiness audit. Single source of truth — the legacy app had this
 * duplicated between lib/auditEngine.js and the route handler. All data comes
 * from free sources: the page itself, robots/sitemap/well-known fetches,
 * dns.google, and a direct TLS handshake.
 */
export async function runFullAudit(rawUrl: string) {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error("Invalid URL");
  const domain = extractDomain(url);

  const [page, robots, dns, soft404, redirects, ssl, wellKnown] = await Promise.all([
    fetchPage(url),
    checkRobotsTxt(url),
    checkDns(domain),
    checkSoft404(url),
    checkRedirects(url),
    checkSslCertificate(domain),
    checkWellKnown(url),
  ]);
  const sitemap = await checkSitemap(url, robots.raw ?? null);

  const signals = parseHtmlSignals(page.html, url);
  const audit: Record<string, AuditCheck> = {
    ...buildFreeChecks(url, signals, robots, sitemap),
    ...buildLockedChecks({
      signals,
      robots,
      dns,
      sitemap,
      headers: page.headers,
      soft404,
      redirects,
      ssl,
      wellKnown,
    }),
  };

  return {
    success: true as const,
    url,
    domain,
    score: calculateScore(audit),
    audit: { url, generatedAt: new Date().toISOString(), isPaid: false, ...audit },
  };
}
