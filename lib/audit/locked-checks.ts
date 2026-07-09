import "server-only";
import type {
  AuditCheck,
  DnsResult,
  HtmlSignals,
  RedirectsResult,
  RobotsResult,
  SitemapResult,
  Soft404Result,
  SslResult,
  WellKnownResult,
} from "@/lib/audit/types";

export type LockedCheckInputs = {
  signals: HtmlSignals;
  robots: RobotsResult;
  dns: DnsResult;
  sitemap: SitemapResult;
  headers: Record<string, string>;
  soft404: Soft404Result;
  redirects: RedirectsResult;
  ssl: SslResult;
  wellKnown: WellKnownResult;
};

/** The locked (paid) checks (ported from auditEngine.js and extended). */
export function buildLockedChecks({
  signals,
  robots,
  dns,
  sitemap,
  headers,
  soft404,
  redirects,
  ssl,
  wellKnown,
}: LockedCheckInputs): Record<string, AuditCheck> {
  const hsts = "strict-transport-security" in headers;
  const noSniff = headers["x-content-type-options"]?.toLowerCase() === "nosniff";
  const compressed = /\b(gzip|br|zstd|deflate)\b/i.test(headers["content-encoding"] ?? "");
  const cached = "cache-control" in headers;
  const headersPassed = [hsts, noSniff, compressed, cached].filter(Boolean).length;

  return {
    dnsHardening: {
      locked: true,
      status: dns.dnssec && dns.caa && dns.dmarc && dns.spf ? "pass" : "fail",
      value: [
        dns.dnssec ? "DNSSEC ✓" : "DNSSEC ✗",
        dns.caa ? "CAA ✓" : "CAA ✗",
        dns.dmarc ? "DMARC ✓" : "DMARC ✗",
        dns.spf ? "SPF ✓" : "SPF ✗",
        dns.mx ? "MX ✓" : "MX ✗",
      ].join(" · "),
      details: { ...dns },
      recommendation: "Publish DNSSEC, CAA, DMARC, SPF and MX records.",
    },
    jsonLd: {
      locked: true,
      status: signals.jsonLd ? "pass" : "fail",
      value: signals.jsonLd
        ? signals.jsonLdTypes.length > 0
          ? `Detected: ${signals.jsonLdTypes.join(", ")}`
          : "Detected"
        : "Missing",
      type: signals.jsonLdTypes[0] ?? null,
      recommendation: signals.jsonLd
        ? signals.jsonLdTypes.length > 0
          ? `JSON-LD schema types found: ${signals.jsonLdTypes.join(", ")}. Consider adding Organization/WebSite if missing.`
          : "JSON-LD found but no @type detected — check its validity."
        : "Add JSON-LD schema.",
    },
    htmlLang: {
      locked: true,
      status: signals.langAttr ? "pass" : "fail",
      value: signals.langAttr ?? "(not set)",
      recommendation: signals.langAttr
        ? `Language: "${signals.langAttr}".`
        : 'Add lang="..." to <html>.',
    },
    ogLocale: {
      locked: true,
      status: signals.ogTags["og:locale"] ? "pass" : "fail",
      value: signals.ogTags["og:locale"] ?? "Missing",
      recommendation: signals.ogTags["og:locale"]
        ? `og:locale: "${signals.ogTags["og:locale"]}".`
        : "Add og:locale.",
    },
    sameAs: {
      locked: true,
      status: signals.sameAsLinks.length > 0 ? "pass" : "fail",
      value: signals.sameAsLinks.length > 0 ? `${signals.sameAsLinks.length} link(s) found` : "Missing",
      links: signals.sameAsLinks,
      recommendation:
        signals.sameAsLinks.length > 0
          ? "sameAs links found."
          : "Add sameAs links (Wikipedia, LinkedIn, Crunchbase).",
    },
    canonical: {
      locked: true,
      status: signals.canonical ? "pass" : "fail",
      value: signals.canonical ?? "Missing",
      recommendation: signals.canonical ? "Canonical link found." : "Add a canonical link.",
    },
    hreflang: {
      locked: true,
      status: signals.hreflang ? "pass" : "fail",
      value: signals.hreflang ? "Present" : "Missing",
      recommendation: signals.hreflang
        ? "Hreflang tags found."
        : "Add hreflang if serving multiple languages.",
    },
    metaRobots: {
      locked: true,
      status: signals.metaRobots && /noindex/i.test(signals.metaRobots) ? "fail" : "info",
      value: signals.metaRobots ?? "(none)",
      recommendation:
        signals.metaRobots && /noindex/i.test(signals.metaRobots)
          ? "This page has a noindex directive — it is excluded from search engines entirely. Remove it unless intentional."
          : signals.metaRobots
            ? `Meta robots: "${signals.metaRobots}"`
            : "No blocking directives.",
    },
    aiRobots: {
      locked: true,
      status: robots.hasAiDirectives ? "info" : "pass",
      value: robots.hasAiDirectives
        ? robots.aiBlocked
          ? "AI crawlers blocked"
          : "AI directives present"
        : "(none)",
      recommendation: robots.hasAiDirectives
        ? "AI directives found in robots.txt."
        : "No AI-blocking directives.",
    },
    aiContentRestrictions: {
      locked: true,
      status: signals.noSnippet || signals.hasPaywall ? "warn" : "pass",
      value: signals.noSnippet
        ? "nosnippet detected"
        : signals.hasPaywall
          ? "Paywall detected"
          : "Open",
      recommendation:
        signals.noSnippet || signals.hasPaywall
          ? "AI summaries may be restricted."
          : "No restrictions — AI can summarise freely.",
    },
    llmsTxt: {
      locked: true,
      status: wellKnown.llmsTxt ? "pass" : "warn",
      value: wellKnown.llmsTxt ? "Present" : "Missing",
      recommendation: wellKnown.llmsTxt
        ? "llms.txt found — AI crawlers get curated guidance about your content."
        : "Add /llms.txt to tell LLM crawlers what your site is about and which pages matter — an emerging AI-visibility standard.",
    },
    securityTxt: {
      locked: true,
      status: wellKnown.securityTxt ? "pass" : "info",
      value: wellKnown.securityTxt ? "Present" : "Missing",
      recommendation: wellKnown.securityTxt
        ? "security.txt found."
        : "Add /.well-known/security.txt so researchers can report vulnerabilities — a trust signal.",
    },
    sslCertificate: {
      locked: true,
      status: !ssl.checked
        ? "info"
        : ssl.daysRemaining !== null && ssl.daysRemaining < 0
          ? "fail"
          : ssl.daysRemaining !== null && ssl.daysRemaining < 21
            ? "warn"
            : "pass",
      value: ssl.checked
        ? `Expires in ${ssl.daysRemaining} day(s)${ssl.issuer ? ` · ${ssl.issuer}` : ""}`
        : "Could not inspect certificate",
      recommendation: !ssl.checked
        ? "TLS certificate could not be inspected."
        : ssl.daysRemaining !== null && ssl.daysRemaining < 21
          ? "Renew the TLS certificate soon — an expired cert takes the whole site offline for users and crawlers."
          : "Certificate validity looks healthy.",
    },
    httpHeaders: {
      locked: true,
      status: headersPassed === 4 ? "pass" : headersPassed >= 2 ? "warn" : "fail",
      value: [
        hsts ? "HSTS ✓" : "HSTS ✗",
        noSniff ? "nosniff ✓" : "nosniff ✗",
        compressed ? "Compression ✓" : "Compression ✗",
        cached ? "Cache-Control ✓" : "Cache-Control ✗",
      ].join(" · "),
      details: { hsts, noSniff, compressed, cached },
      recommendation:
        headersPassed === 4
          ? "Security and performance headers look good."
          : "Add Strict-Transport-Security, X-Content-Type-Options: nosniff, response compression (gzip/brotli) and Cache-Control headers.",
    },
    redirectConsistency: {
      locked: true,
      status: !redirects.checked ? "info" : redirects.consistent ? "pass" : "warn",
      value: !redirects.checked
        ? "Could not check"
        : redirects.consistent
          ? `All variants → ${redirects.canonicalHost}`
          : `Variants resolve to ${[...new Set(Object.values(redirects.variants))].join(", ")}`,
      recommendation: redirects.consistent
        ? "http/https and www/non-www all redirect to one canonical host."
        : "Redirect all host variants (http/https, www/non-www) to a single canonical host with 301s — split hosts dilute ranking signals.",
    },
    soft404: {
      locked: true,
      status: !soft404.checked ? "info" : soft404.soft404 ? "fail" : "pass",
      value: !soft404.checked
        ? "Could not check"
        : soft404.soft404
          ? "Missing pages return 200 (soft 404)"
          : `Missing pages return ${soft404.status}`,
      recommendation: soft404.soft404
        ? "Return a real 404 status for missing pages — soft 404s waste crawl budget and pollute the index."
        : "Missing pages return a proper error status.",
    },
    sitemapHealth: {
      locked: true,
      status: !sitemap.present
        ? "info"
        : sitemap.sampledOk === false || sitemap.urlCount === 0
          ? "warn"
          : "pass",
      value: !sitemap.present
        ? "No sitemap"
        : `${sitemap.urlCount ?? "?"} URL(s)${
            sitemap.sampledOk !== undefined
              ? sitemap.sampledOk
                ? " · sampled URL resolves"
                : " · sampled URL broken"
              : ""
          }`,
      recommendation: !sitemap.present
        ? "Add a sitemap first."
        : sitemap.urlCount === 0
          ? "Sitemap exists but lists no URLs — regenerate it."
          : sitemap.sampledOk === false
            ? "A sampled sitemap URL didn't resolve — prune dead entries so crawlers trust the sitemap."
            : "Sitemap entries look healthy.",
    },
    linkHygiene: {
      locked: true,
      status: signals.unsafeBlankLinks > 0 ? "warn" : "pass",
      value: `${signals.internalLinks} internal · ${signals.externalLinks} external${
        signals.unsafeBlankLinks > 0 ? ` · ${signals.unsafeBlankLinks} unsafe _blank` : ""
      }`,
      recommendation:
        signals.unsafeBlankLinks > 0
          ? `Add rel="noopener" to the ${signals.unsafeBlankLinks} target="_blank" link(s) missing it (security + performance).`
          : "Link structure looks healthy.",
    },
  };
}
