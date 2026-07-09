import { NextResponse } from "next/server";
import { z } from "zod";
import { endpoints, TRAFFIC_COUNTRIES, toDomain } from "@/lib/dataforseo/endpoints";
import { fetchDataForSeo } from "@/lib/dataforseo/client";
import {
  normalizeTraffic,
  normalizeTrafficHistory,
  normalizeDomainAuthority,
  normalizeBacklinks,
  normalizeDomainAge,
  normalizeCompetitors,
  parseAiVisibility,
} from "@/lib/dataforseo/normalize";
import { domainSchema } from "@/lib/validation/common";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const domainBody = z.object({ domain: domainSchema });
const brandBody = z.object({ brand: z.string().trim().min(1).max(253) });
const serpCheckerBody = z.object({
  keyword: z.string().trim().min(1).max(200),
  domain: domainSchema,
  country: z.string().trim().max(60).optional(),
});
const serpAnalyzerBody = z.object({
  keyword: z.string().trim().min(1).max(200),
  country: z.string().trim().max(60).optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

/**
 * One handler for all SEO tool proxies, now backed by DataForSEO. Each tool
 * builds a DataForSEO request via lib/dataforseo/endpoints, then normalizes
 * the raw tasks[0].result[0] payload into the flat shape the website-analysis
 * sections read.
 */
const TOOLS: Record<
  string,
  { schema: z.ZodTypeAny; run: (body: never) => Promise<unknown> }
> = {
  traffic: {
    schema: domainBody,
    run: async (body: { domain: string }) => {
      const req = endpoints.websiteTraffic(body);
      return normalizeTraffic(await fetchDataForSeo(req.path, req.body, req.timeoutMs));
    },
  },
  "traffic-by-country": {
    schema: domainBody,
    run: async (body: { domain: string }) => {
      const results = await Promise.all(
        TRAFFIC_COUNTRIES.map(async (c) => {
          const req = endpoints.websiteTrafficForCountry({ domain: body.domain, locationCode: c.code });
          try {
            const traffic = normalizeTraffic(await fetchDataForSeo(req.path, req.body, req.timeoutMs));
            return { country: c.name, organicTraffic: traffic.organicTraffic ?? 0 };
          } catch {
            return { country: c.name, organicTraffic: 0 };
          }
        })
      );
      return { countries: results };
    },
  },
  "traffic-history": {
    schema: domainBody,
    run: async (body: { domain: string }) => {
      const req = endpoints.websiteTrafficHistory(body);
      return { history: normalizeTrafficHistory(await fetchDataForSeo(req.path, req.body, req.timeoutMs)) };
    },
  },
  "domain-authority": {
    schema: domainBody,
    run: async (body: { domain: string }) => {
      const req = endpoints.backlinkSummary(body);
      const result = await fetchDataForSeo<Loose>(req.path, req.body, req.timeoutMs);
      return { ...normalizeDomainAuthority(result), domain: toDomain(body.domain) };
    },
  },
  backlinks: {
    schema: domainBody,
    run: async (body: { domain: string }) => {
      const req = endpoints.backlinkSummary(body);
      return normalizeBacklinks(await fetchDataForSeo(req.path, req.body, req.timeoutMs));
    },
  },
  "domain-age": {
    schema: domainBody,
    run: async (body: { domain: string }) => {
      const req = endpoints.domainAge(body);
      return normalizeDomainAge(await fetchDataForSeo(req.path, req.body, req.timeoutMs));
    },
  },
  "serp-checker": {
    schema: serpCheckerBody,
    run: async (body: { keyword: string; domain: string; country?: string }) => {
      const req = endpoints.serpChecker(body);
      const result = await fetchDataForSeo<Loose>(req.path, req.body, req.timeoutMs);
      const items: Loose[] = result?.items ?? [];
      const target = toDomain(body.domain);
      const match = items.find((it) => it.domain && String(it.domain).includes(target));
      return {
        found: Boolean(match),
        position: match?.rank_absolute ?? null,
        url: match?.url ?? null,
        title: match?.title ?? null,
      };
    },
  },
  "serp-analyzer": {
    schema: serpAnalyzerBody,
    run: async (body: { keyword: string; country?: string }) => {
      const req = endpoints.serpAnalyzer(body);
      const result = await fetchDataForSeo<Loose>(req.path, req.body, req.timeoutMs);
      const items: Loose[] = result?.items ?? [];
      return {
        results: items.map((it) => ({
          position: it.rank_absolute,
          domain: it.domain,
          url: it.url,
          title: it.title,
          description: it.description,
        })),
      };
    },
  },
  "ai-visibility/chatgpt": {
    schema: brandBody,
    run: async (body: { brand: string }) => {
      const req = endpoints.aiVisibilityChatgpt(body);
      return parseAiVisibility(await fetchDataForSeo(req.path, req.body, req.timeoutMs));
    },
  },
  "ai-visibility/gemini": {
    schema: brandBody,
    run: async (body: { brand: string }) => {
      const req = endpoints.aiVisibilityGemini(body);
      return parseAiVisibility(await fetchDataForSeo(req.path, req.body, req.timeoutMs));
    },
  },
  "ai-visibility/perplexity": {
    schema: brandBody,
    run: async (body: { brand: string }) => {
      const req = endpoints.aiVisibilityPerplexity(body);
      return parseAiVisibility(await fetchDataForSeo(req.path, req.body, req.timeoutMs));
    },
  },
  "competitor-analysis": {
    schema: domainBody,
    run: async (body: { domain: string }) => {
      const req = endpoints.competitorAnalysis(body);
      return { competitors: normalizeCompetitors(await fetchDataForSeo(req.path, req.body, req.timeoutMs)) };
    },
  },
};

export async function POST(request: Request, ctx: { params: Promise<{ tool: string[] }> }) {
  const limit = rateLimit(clientKey(request, "seo"), { limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const { tool: segments } = await ctx.params;
  const tool = TOOLS[segments.join("/")];
  if (!tool) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 404 });
  }

  const parsed = tool.schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const data = await tool.run(parsed.data as never);
    return NextResponse.json(data);
  } catch (err) {
    logger.error("SEO tool request failed", {
      tool: segments.join("/"),
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Upstream request failed" }, { status: 502 });
  }
}
