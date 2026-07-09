import "server-only";
import type { HtmlSignals } from "@/lib/audit/types";

const EMPTY: HtmlSignals = {
  title: null,
  metaDescription: null,
  h1: null,
  h1Count: 0,
  headingLevelsSkipped: false,
  langAttr: null,
  canonical: null,
  hreflang: false,
  metaRobots: null,
  ogTags: {},
  twitterCard: null,
  viewport: false,
  jsonLd: null,
  jsonLdTypes: [],
  sameAsLinks: [],
  noSnippet: false,
  hasPaywall: false,
  favicon: false,
  appleTouchIcon: false,
  rssFeed: false,
  imgTotal: 0,
  imgMissingAlt: 0,
  mixedContentCount: 0,
  internalLinks: 0,
  externalLinks: 0,
  unsafeBlankLinks: 0,
};

/** Collect every @type across all ld+json blocks (including @graph nodes). */
function collectJsonLdTypes(node: unknown, into: Set<string>) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdTypes(item, into);
    return;
  }
  const record = node as Record<string, unknown>;
  const type = record["@type"];
  if (typeof type === "string") into.add(type);
  else if (Array.isArray(type)) for (const t of type) if (typeof t === "string") into.add(t);
  if (record["@graph"]) collectJsonLdTypes(record["@graph"], into);
}

/** Regex-based signal extraction, ported from the legacy auditEngine.js and extended. */
export function parseHtmlSignals(html: string | null, pageUrl?: string): HtmlSignals {
  if (!html) return EMPTY;

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : null;

  const metaDescMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)[^>]+name=["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : null;

  const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  const canonicalMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);

  const metaRobotsMatch =
    html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)[^>]+name=["']robots["']/i);
  const metaRobots = metaRobotsMatch ? metaRobotsMatch[1].trim() : null;

  const twitterCardMatch =
    html.match(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)[^>]+name=["']twitter:card["']/i);

  const ogTags: Record<string, string> = {};
  for (const m of html.matchAll(/<meta[^>]+property=["'](og:[^"']+)["'][^>]+content=["']([^"']*)/gi))
    ogTags[m[1]] = m[2];
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']*)[^>]+property=["'](og:[^"']+)["']/gi))
    ogTags[m[2]] = m[1];

  let jsonLd: Record<string, unknown> | null = null;
  let sameAsLinks: string[] = [];
  const jsonLdTypeSet = new Set<string>();
  for (const scriptMatch of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      const parsed = JSON.parse(scriptMatch[1].trim());
      collectJsonLdTypes(parsed, jsonLdTypeSet);
      if (!jsonLd) {
        jsonLd = parsed;
        const graph = (parsed?.["@graph"] as Record<string, unknown>[] | undefined)?.[0];
        const sameAs = parsed?.sameAs ?? graph?.sameAs;
        if (Array.isArray(sameAs)) sameAsLinks = sameAs;
        else if (typeof sameAs === "string") sameAsLinks = [sameAs];
      }
    } catch {
      if (!jsonLd) jsonLd = { raw: scriptMatch[1].slice(0, 200) };
    }
  }

  // Heading structure: count H1s and detect skipped levels (e.g. H1 → H3).
  const headingLevels = [...html.matchAll(/<h([1-6])[\b\s>]/gi)].map((m) => Number(m[1]));
  const h1Count = headingLevels.filter((l) => l === 1).length;
  let headingLevelsSkipped = false;
  let maxSeen = 0;
  for (const level of headingLevels) {
    if (maxSeen > 0 && level > maxSeen + 1) {
      headingLevelsSkipped = true;
      break;
    }
    maxSeen = Math.max(maxSeen, level);
  }

  // Image alt coverage.
  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const imgMissingAlt = imgTags.filter((tag) => !/\balt\s*=\s*["'][^"']+["']/i.test(tag)).length;

  // Mixed content: http:// subresources (src= anywhere, href= on <link>) on an https page.
  const isHttpsPage = pageUrl?.startsWith("https://") ?? true;
  const mixedContentCount = isHttpsPage
    ? [...html.matchAll(/\bsrc\s*=\s*["']http:\/\/[^"']+["']/gi)].length +
      [...html.matchAll(/<link\b[^>]*href\s*=\s*["']http:\/\/[^"']+["']/gi)].length
    : 0;

  // Link hygiene: internal vs external <a href>, and target=_blank without noopener.
  const pageHost = (() => {
    try {
      return pageUrl ? new URL(pageUrl).hostname.replace(/^www\./, "") : null;
    } catch {
      return null;
    }
  })();
  let internalLinks = 0;
  let externalLinks = 0;
  let unsafeBlankLinks = 0;
  for (const m of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#][^"']*)["'][^>]*>/gi)) {
    const tag = m[0];
    const href = m[1];
    if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
    if (/^https?:\/\//i.test(href)) {
      try {
        const host = new URL(href).hostname.replace(/^www\./, "");
        if (pageHost && host === pageHost) internalLinks++;
        else externalLinks++;
      } catch {
        // unparsable absolute href — skip
      }
    } else {
      internalLinks++;
    }
    if (/target\s*=\s*["']_blank["']/i.test(tag) && !/rel\s*=\s*["'][^"']*noopener/i.test(tag)) {
      unsafeBlankLinks++;
    }
  }

  return {
    title,
    metaDescription,
    h1,
    h1Count,
    headingLevelsSkipped,
    langAttr: langMatch ? langMatch[1] : null,
    canonical: canonicalMatch ? canonicalMatch[1] : null,
    hreflang: /<link[^>]+hreflang/i.test(html),
    metaRobots,
    ogTags,
    twitterCard: twitterCardMatch ? twitterCardMatch[1].trim() : null,
    viewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    jsonLd,
    jsonLdTypes: [...jsonLdTypeSet],
    sameAsLinks,
    noSnippet: metaRobots ? /nosnippet/i.test(metaRobots) : false,
    hasPaywall: /paywall|subscriber.only|premium.content|paid.content/i.test(html),
    favicon:
      /<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(html) ||
      /<link[^>]+rel=["']icon["']/i.test(html),
    appleTouchIcon: /<link[^>]+rel=["']apple-touch-icon/i.test(html),
    rssFeed: /<link[^>]+type=["']application\/(?:rss|atom)\+xml["']/i.test(html),
    imgTotal: imgTags.length,
    imgMissingAlt,
    mixedContentCount,
    internalLinks,
    externalLinks,
    unsafeBlankLinks,
  };
}
