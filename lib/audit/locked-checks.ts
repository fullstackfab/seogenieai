import "server-only";
import type { AuditCheck, DnsResult, HtmlSignals, RobotsResult } from "@/lib/audit/types";

/** The 10 locked (paid) checks (ported from auditEngine.js). */
export function buildLockedChecks(
  signals: HtmlSignals,
  robots: RobotsResult,
  dns: DnsResult
): Record<string, AuditCheck> {
  return {
    dnsHardening: {
      locked: true,
      status: dns.dnssec && dns.caa && dns.dmarc && dns.spf ? "pass" : "fail",
      value: [
        dns.dnssec ? "DNSSEC ✓" : "DNSSEC ✗",
        dns.caa ? "CAA ✓" : "CAA ✗",
        dns.dmarc ? "DMARC ✓" : "DMARC ✗",
        dns.spf ? "SPF ✓" : "SPF ✗",
      ].join(" · "),
      details: { ...dns },
      recommendation: "Publish DNSSEC, CAA, DMARC and SPF records.",
    },
    jsonLd: {
      locked: true,
      status: signals.jsonLd ? "pass" : "fail",
      value: signals.jsonLd ? "Detected" : "Missing",
      type: (signals.jsonLd?.["@type"] as string | undefined) ?? null,
      recommendation: signals.jsonLd
        ? `JSON-LD found (${(signals.jsonLd?.["@type"] as string | undefined) ?? "unknown type"}).`
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
      status: "info",
      value: signals.metaRobots ?? "(none)",
      recommendation: signals.metaRobots
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
  };
}
