import "server-only";
import type { HtmlSignals } from "@/lib/audit/types";

const EMPTY: HtmlSignals = {
  title: null,
  metaDescription: null,
  h1: null,
  langAttr: null,
  canonical: null,
  hreflang: false,
  metaRobots: null,
  ogTags: {},
  twitterCard: null,
  viewport: false,
  jsonLd: null,
  sameAsLinks: [],
  noSnippet: false,
  hasPaywall: false,
};

/** Regex-based signal extraction, ported 1:1 from the legacy auditEngine.js. */
export function parseHtmlSignals(html: string | null): HtmlSignals {
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
  const jsonLdMatch = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (jsonLdMatch) {
    try {
      jsonLd = JSON.parse(jsonLdMatch[1].trim());
      const graph = (jsonLd?.["@graph"] as Record<string, unknown>[] | undefined)?.[0];
      const sameAs = jsonLd?.sameAs ?? graph?.sameAs;
      if (Array.isArray(sameAs)) sameAsLinks = sameAs;
      else if (typeof sameAs === "string") sameAsLinks = [sameAs];
    } catch {
      jsonLd = { raw: jsonLdMatch[1].slice(0, 200) };
    }
  }

  return {
    title,
    metaDescription,
    h1,
    langAttr: langMatch ? langMatch[1] : null,
    canonical: canonicalMatch ? canonicalMatch[1] : null,
    hreflang: /<link[^>]+hreflang/i.test(html),
    metaRobots,
    ogTags,
    twitterCard: twitterCardMatch ? twitterCardMatch[1].trim() : null,
    viewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    jsonLd,
    sameAsLinks,
    noSnippet: metaRobots ? /nosnippet/i.test(metaRobots) : false,
    hasPaywall: /paywall|subscriber.only|premium.content|paid.content/i.test(html),
  };
}
