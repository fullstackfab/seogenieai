import "server-only";
import tls from "node:tls";
import type {
  DnsResult,
  PageFetchResult,
  RedirectsResult,
  RobotsResult,
  SitemapResult,
  Soft404Result,
  SslResult,
  WellKnownResult,
} from "@/lib/audit/types";

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
  return (await fetchPage(url)).html;
}

/** Page HTML plus the response headers the httpHeaders check audits. */
export async function fetchPage(url: string): Promise<PageFetchResult> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SEOGenieBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    if (!res.ok) return { html: null, headers };
    return { html: await res.text(), headers };
  } catch {
    return { html: null, headers: {} };
  }
}

/** A 200 for a garbage path means missing pages aren't returning 404 (soft-404). */
export async function checkSoft404(baseUrl: string): Promise<Soft404Result> {
  try {
    const res = await fetch(`${baseUrl}/seogenie-404-probe-${Date.now()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SEOGenieBot/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    return { checked: true, soft404: res.status === 200, status: res.status };
  } catch {
    return { checked: false, soft404: false, status: null };
  }
}

/**
 * Fetch the four host variants (http/https × www/non-www) and confirm they
 * all converge on one canonical host via redirects.
 */
export async function checkRedirects(url: string): Promise<RedirectsResult> {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return { checked: false, consistent: false, canonicalHost: null, variants: {} };
  }

  const candidates = [
    `http://${host}`,
    `http://www.${host}`,
    `https://${host}`,
    `https://www.${host}`,
  ];

  const variants: Record<string, string> = {};
  await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const res = await fetch(candidate, {
          method: "HEAD",
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; SEOGenieBot/1.0)" },
          signal: AbortSignal.timeout(8_000),
        });
        variants[candidate] = new URL(res.url).host;
      } catch {
        // unreachable variant (e.g. www subdomain has no DNS record) — skip
      }
    })
  );

  const finalHosts = [...new Set(Object.values(variants))];
  return {
    checked: Object.keys(variants).length > 0,
    consistent: finalHosts.length === 1,
    canonicalHost: finalHosts.length === 1 ? finalHosts[0] : null,
    variants,
  };
}

/** llms.txt (AI-crawler guidance) and .well-known/security.txt presence. */
export async function checkWellKnown(baseUrl: string): Promise<WellKnownResult> {
  async function exists(path: string): Promise<boolean> {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        redirect: "follow",
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) return false;
      // Some sites 200 every path (soft-404s) — require plausible text content.
      const type = res.headers.get("content-type") ?? "";
      if (/text\/html/i.test(type)) return false;
      const body = await res.text();
      return body.trim().length > 0;
    } catch {
      return false;
    }
  }

  const [llmsTxt, securityTxt] = await Promise.all([
    exists("/llms.txt"),
    exists("/.well-known/security.txt"),
  ]);
  return { llmsTxt, securityTxt };
}

/** TLS certificate expiry/issuer via a direct handshake (no external API). */
export function checkSslCertificate(domain: string): Promise<SslResult> {
  return new Promise((resolve) => {
    const fallback: SslResult = { checked: false, validTo: null, daysRemaining: null, issuer: null };
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(fallback);
    }, 8_000);

    const socket = tls.connect(
      { host: domain, port: 443, servername: domain, rejectUnauthorized: false },
      () => {
        clearTimeout(timer);
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert?.valid_to) {
          resolve(fallback);
          return;
        }
        const validTo = new Date(cert.valid_to);
        resolve({
          checked: true,
          validTo: validTo.toISOString(),
          daysRemaining: Math.floor((validTo.getTime() - Date.now()) / 86_400_000),
          issuer: [cert.issuer?.O ?? cert.issuer?.CN].flat()[0] ?? null,
        });
      }
    );
    socket.on("error", () => {
      clearTimeout(timer);
      resolve(fallback);
    });
  });
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
  let sitemapUrl: string | null = null;
  if (robotsTxtRaw) {
    const match = robotsTxtRaw.match(/Sitemap:\s*(.+)/i);
    if (match) sitemapUrl = match[1].trim();
  }
  if (!sitemapUrl) {
    try {
      const res = await fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(8_000) });
      if (res.ok) sitemapUrl = `${baseUrl}/sitemap.xml`;
    } catch {
      // treated as missing
    }
  }
  if (!sitemapUrl) return { present: false, url: null };
  return { present: true, url: sitemapUrl, ...(await inspectSitemap(sitemapUrl)) };
}

/** Parse the sitemap: count <loc> entries and spot-check that a sampled URL still resolves. */
async function inspectSitemap(
  sitemapUrl: string
): Promise<{ urlCount?: number; sampledOk?: boolean }> {
  try {
    const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return {};
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1]);
    if (locs.length === 0) return { urlCount: 0 };

    // A sitemap index nests sitemaps rather than pages — count entries, sample one child sitemap's first page.
    let sampleUrl = locs[Math.floor(locs.length / 2)];
    if (/<sitemapindex/i.test(xml)) {
      try {
        const childRes = await fetch(sampleUrl, { signal: AbortSignal.timeout(8_000) });
        const childXml = childRes.ok ? await childRes.text() : "";
        const childLoc = childXml.match(/<loc>\s*([^<]+?)\s*<\/loc>/i);
        if (childLoc) sampleUrl = childLoc[1];
      } catch {
        // sample the index entry itself below
      }
    }

    try {
      const sampleRes = await fetch(sampleUrl, {
        method: "HEAD",
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SEOGenieBot/1.0)" },
        signal: AbortSignal.timeout(8_000),
      });
      return { urlCount: locs.length, sampledOk: sampleRes.ok };
    } catch {
      return { urlCount: locs.length };
    }
  } catch {
    return {};
  }
}

/** DNS-over-HTTPS checks via dns.google (DNSSEC, CAA, DMARC, SPF, MX). */
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

  const [a, caa, dmarc, spf, mx] = await Promise.all([
    dnsQuery(domain, "A"),
    dnsQuery(domain, "CAA"),
    dnsQuery(`_dmarc.${domain}`, "TXT"),
    dnsQuery(domain, "TXT"),
    dnsQuery(domain, "MX"),
  ]);

  const answers = (r: Record<string, unknown> | null) => (r?.Answer as { data?: string }[]) ?? [];
  return {
    dnssec: a?.AD === true,
    caa: answers(caa).length > 0,
    dmarc: answers(dmarc).some((r) => r.data?.includes("v=DMARC1")),
    spf: answers(spf).some((r) => r.data?.includes("v=spf1")),
    mx: answers(mx).length > 0,
  };
}
