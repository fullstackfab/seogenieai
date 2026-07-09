import "server-only";
import type { AuditCheck, HtmlSignals, RobotsResult, SitemapResult } from "@/lib/audit/types";

/** The 9 free checks shown before payment (ported from auditEngine.js). */
export function buildFreeChecks(
  url: string,
  signals: HtmlSignals,
  robots: RobotsResult,
  sitemap: SitemapResult
): Record<string, AuditCheck> {
  const https = url.startsWith("https://");
  const ogCount = Object.keys(signals.ogTags).length;

  return {
    https: {
      status: https ? "pass" : "fail",
      value: https ? "Secure (HTTPS)" : "Not Secure (HTTP)",
      recommendation: https
        ? "Your site uses HTTPS. Best practice for security and SEO."
        : "Migrate to HTTPS immediately.",
    },
    title: {
      status: signals.title
        ? signals.title.length >= 30 && signals.title.length <= 65
          ? "pass"
          : "warn"
        : "fail",
      value: signals.title,
      length: signals.title?.length ?? 0,
      recommendation: !signals.title
        ? "Add a descriptive <title> tag."
        : signals.title.length < 30
          ? "Title too short. Aim for 30–65 characters."
          : signals.title.length > 65
            ? "Title too long. Keep under 65 characters."
            : "Title length looks good.",
    },
    metaDescription: {
      status: signals.metaDescription
        ? signals.metaDescription.length >= 70 && signals.metaDescription.length <= 160
          ? "pass"
          : "warn"
        : "fail",
      value: signals.metaDescription,
      length: signals.metaDescription?.length ?? 0,
      recommendation: !signals.metaDescription
        ? "Add a meta description tag."
        : signals.metaDescription.length < 70
          ? "Too short. Aim for 70–160 characters."
          : signals.metaDescription.length > 160
            ? "Too long. Keep under 160 characters."
            : "Meta description length looks good.",
    },
    robotsTxt: {
      status: robots.present ? "pass" : "fail",
      value: robots.present ? "Present" : "Missing",
      recommendation: robots.present ? "robots.txt found." : "Add robots.txt to guide crawlers.",
    },
    sitemap: {
      status: sitemap.present ? "pass" : "fail",
      value: sitemap.present ? sitemap.url : "Missing",
      recommendation: sitemap.present
        ? "Sitemap detected."
        : "Add /sitemap.xml or reference in robots.txt.",
    },
    h1: {
      status: signals.h1 ? "pass" : "fail",
      value: signals.h1 ?? "None",
      recommendation: signals.h1 ? "H1 heading found." : "Add a single descriptive H1.",
    },
    openGraph: {
      status: ogCount >= 3 ? "pass" : signals.ogTags["og:title"] ? "warn" : "fail",
      value: ogCount >= 3 ? "Detected" : signals.ogTags["og:title"] ? "Partial" : "Missing",
      tags: signals.ogTags,
      recommendation:
        ogCount >= 3 ? "OG tags found." : "Add og:title, og:description, og:image.",
    },
    twitterCard: {
      status: signals.twitterCard ? "pass" : "fail",
      value: signals.twitterCard ? `Detected (${signals.twitterCard})` : "Missing",
      recommendation: signals.twitterCard
        ? "Twitter Card meta found."
        : "Add twitter:card meta tag.",
    },
    viewport: {
      status: signals.viewport ? "pass" : "fail",
      value: signals.viewport ? "Present" : "Missing",
      recommendation: signals.viewport ? "Viewport meta found." : "Add <meta name='viewport'>.",
    },
  };
}
