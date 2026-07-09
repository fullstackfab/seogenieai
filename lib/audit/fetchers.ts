import "server-only";
import type { DnsResult, RobotsResult, SitemapResult } from "@/lib/audit/types";

export function normalizeUrl(url: string): string | null {
  if (!url) return null;
  const withProto = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  try {
    return new URL(withProto).href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SEOGenieBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function checkRobotsTxt(baseUrl: string): Promise<RobotsResult> {
  try {
    const res = await fetch(`${baseUrl}/robots.txt`, { signal: AbortSignal.timeout(8_000) });
    if (res.ok) {
      const text = await res.text();
      return {
        present: true,
        hasAiDirectives: /GPTBot/i.test(text) || /CCBot/i.test(text),
        aiBlocked: (/GPTBot/i.test(text) && /Disallow:\s*\//i.test(text)) || false,
        raw: text.slice(0, 500),
      };
    }
  } catch {
    // treated as missing
  }
  return { present: false, hasAiDirectives: false, aiBlocked: false };
}

export async function checkSitemap(
  baseUrl: string,
  robotsTxtRaw: string | null
): Promise<SitemapResult> {
  if (robotsTxtRaw) {
    const match = robotsTxtRaw.match(/Sitemap:\s*(.+)/i);
    if (match) return { present: true, url: match[1].trim() };
  }
  try {
    const res = await fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(8_000) });
    if (res.ok) return { present: true, url: `${baseUrl}/sitemap.xml` };
  } catch {
    // treated as missing
  }
  return { present: false, url: null };
}

/** DNS-over-HTTPS checks via dns.google (DNSSEC, CAA, DMARC, SPF). */
export async function checkDns(domain: string): Promise<DnsResult> {
  async function dnsQuery(name: string, type: string): Promise<Record<string, unknown> | null> {
    try {
      const res = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
        { signal: AbortSignal.timeout(8_000) }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  const [a, caa, dmarc, spf] = await Promise.all([
    dnsQuery(domain, "A"),
    dnsQuery(domain, "CAA"),
    dnsQuery(`_dmarc.${domain}`, "TXT"),
    dnsQuery(domain, "TXT"),
  ]);

  const answers = (r: Record<string, unknown> | null) => (r?.Answer as { data?: string }[]) ?? [];
  return {
    dnssec: a?.AD === true,
    caa: answers(caa).length > 0,
    dmarc: answers(dmarc).some((r) => r.data?.includes("v=DMARC1")),
    spf: answers(spf).some((r) => r.data?.includes("v=spf1")),
  };
}
