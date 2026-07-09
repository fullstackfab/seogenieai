import "server-only";
import { endpoints } from "@/lib/dataforseo/endpoints";
import { fetchDataForSeo } from "@/lib/dataforseo/client";
import {
  normalizeDomainAuthority,
  normalizeBacklinks,
  normalizeDomainAge,
  parseAiVisibility,
} from "@/lib/dataforseo/normalize";
import { extractDomain } from "@/lib/validation/common";
import { logger } from "@/lib/logger";

/* Paid-report data fetchers, backed by DataForSEO. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

async function upstream(req: { path: string; body: Record<string, unknown>; timeoutMs?: number }): Promise<Loose | null> {
  try {
    return await fetchDataForSeo(req.path, req.body, req.timeoutMs ?? 15_000);
  } catch (err) {
    logger.error("DataForSEO upstream call failed", {
      path: req.path,
      message: err instanceof Error ? err.message : "unknown",
    });
    return null;
  }
}

export async function fetchDomainAuthority(domain: string) {
  const data = await upstream(endpoints.backlinkSummary({ domain }));
  if (!data) return null;
  const norm = normalizeDomainAuthority(data);
  return {
    domainAuthority: norm.domainAuthority,
    pageAuthority: null,
    spamScore: data?.backlinks_spam_score ?? null,
    linkingDomains: data?.referring_domains ?? null,
    inboundLinks: data?.backlinks ?? null,
  };
}

export async function fetchBacklinks(domain: string) {
  const data = await upstream(endpoints.backlinkSummary({ domain }));
  if (!data) return null;
  const norm = normalizeBacklinks(data);
  return {
    totalBacklinks: norm.totalBacklinks,
    referringDomains: norm.referringDomains,
    referringPages: norm.referringPages,
    referringIPs: norm.referringIPs,
    crawledPages: norm.crawledPages,
    spamScore: norm.spamScore,
    brokenBacklinks: norm.brokenBacklinks,
    dofollowLinks: norm.dofollowLinks,
    nofollowLinks: norm.nofollowLinks,
    governmentLinks: norm.governmentLinks,
    eduLinks: norm.eduLinks,
    domainAuthority: norm.domainAuthority,
  };
}

export async function fetchDomainAge(domain: string) {
  const data = await upstream(endpoints.domainAge({ domain }));
  if (!data) return null;
  const norm = normalizeDomainAge(data);
  let age: number | null = null;
  if (norm.registrationDate) {
    const created = new Date(norm.registrationDate);
    if (!isNaN(created.getTime())) {
      age = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
  }
  return { ...norm, age };
}

export async function fetchAiVisibility(domain: string) {
  const [chatgpt, gemini] = await Promise.all([
    upstream(endpoints.aiVisibilityChatgpt({ brand: domain })),
    upstream(endpoints.aiVisibilityGemini({ brand: domain })),
  ]);
  return {
    chatgpt: chatgpt ? parseAiVisibility(chatgpt) : null,
    gemini: gemini ? parseAiVisibility(gemini) : null,
  };
}

export async function runFullPaidData(url: string) {
  const domain = extractDomain(url);
  const [domainAuthority, backlinks, domainAge, aiVisibility] = await Promise.all([
    fetchDomainAuthority(domain),
    fetchBacklinks(domain),
    fetchDomainAge(domain),
    fetchAiVisibility(domain),
  ]);

  // Cross-fallback: the backlinks endpoint also returns DA & spam score.
  const resolvedDA: Loose = domainAuthority ?? {};
  if (resolvedDA.domainAuthority == null && backlinks?.domainAuthority != null) {
    resolvedDA.domainAuthority = backlinks.domainAuthority;
  }
  if (resolvedDA.spamScore == null && backlinks?.spamScore != null) {
    resolvedDA.spamScore = backlinks.spamScore;
  }

  return { domain, domainAuthority: resolvedDA, backlinks, domainAge, aiVisibility };
}
