import "server-only";
import type { AuditCheck, HtmlSignals, RobotsResult, SitemapResult } from "@/lib/audit/types";

/** The free checks shown before payment (ported from auditEngine.js and extended). */
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
      value: sitemap.present
        ? `${sitemap.url}${sitemap.urlCount !== undefined ? ` (${sitemap.urlCount} entries)` : ""}`
        : "Missing",
      recommendation: sitemap.present
        ? "Sitemap detected."
        : "Add /sitemap.xml or reference in robots.txt.",
    },
    h1: {
      status: signals.h1 ? "pass" : "fail",
      value: signals.h1 ?? "None",
      recommendation: signals.h1 ? "H1 heading found." : "Add a single descriptive H1.",
    },
    headings: {
      status:
        signals.h1Count > 1 || signals.headingLevelsSkipped
          ? "warn"
          : signals.h1Count === 1
            ? "pass"
            : "info",
      value:
        signals.h1Count > 1
          ? `${signals.h1Count} H1 tags found`
          : signals.headingLevelsSkipped
            ? "Heading levels skipped"
            : signals.h1Count === 1
              ? "Clean hierarchy"
              : "No headings detected",
      recommendation:
        signals.h1Count > 1
          ? "Use exactly one H1 per page; demote the others to H2/H3."
          : signals.headingLevelsSkipped
            ? "Don't skip heading levels (e.g. H1 → H3) — keep the hierarchy sequential."
            : "Heading structure looks good.",
    },
    imageAlt: {
      status:
        signals.imgTotal === 0
          ? "info"
          : signals.imgMissingAlt === 0
            ? "pass"
            : signals.imgMissingAlt / signals.imgTotal > 0.3
              ? "fail"
              : "warn",
      value:
        signals.imgTotal === 0
          ? "No images on page"
          : `${signals.imgTotal - signals.imgMissingAlt}/${signals.imgTotal} images have alt text`,
      recommendation:
        signals.imgMissingAlt === 0
          ? "All images have alt text."
          : `Add descriptive alt text to the ${signals.imgMissingAlt} image(s) missing it — required for accessibility and image SEO.`,
    },
    favicon: {
      status: signals.favicon ? "pass" : "warn",
      value: [
        signals.favicon ? "Favicon ✓" : "Favicon ✗",
        signals.appleTouchIcon ? "Apple touch icon ✓" : "Apple touch icon ✗",
      ].join(" · "),
      recommendation: signals.favicon
        ? signals.appleTouchIcon
          ? "Icons found."
          : "Add an apple-touch-icon for iOS bookmarks and share sheets."
        : "Add a favicon — it appears in search results and browser tabs.",
    },
    mixedContent: {
      status: signals.mixedContentCount > 0 ? "fail" : "pass",
      value:
        signals.mixedContentCount > 0
          ? `${signals.mixedContentCount} insecure http:// resource(s)`
          : "None",
      recommendation:
        signals.mixedContentCount > 0
          ? "Serve all scripts, styles and images over https:// — browsers block or downgrade mixed content."
          : "No mixed content detected.",
    },
    rssFeed: {
      status: signals.rssFeed ? "pass" : "info",
      value: signals.rssFeed ? "Detected" : "Not detected",
      recommendation: signals.rssFeed
        ? "RSS/Atom feed advertised."
        : "If you publish content regularly, advertise an RSS/Atom feed — some AI crawlers and aggregators use it for discovery.",
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
