import "server-only";
import { env } from "@/lib/env";
import { TtlCache } from "@/lib/cache/ttl-cache";
import { logger } from "@/lib/logger";

const BASE = "https://api.dataforseo.com/v3";
const DEFAULT_TIMEOUT_MS = 60_000;
const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new TtlCache<unknown>(CACHE_TTL_MS);

function authHeader(): string {
  const token = Buffer.from(`${env.DATAFORSEO_LOGIN}:${env.DATAFORSEO_PASSWORD}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * POSTs one task to a DataForSEO `.../live` endpoint and returns the single
 * result object at tasks[0].result[0] (DataForSEO's live endpoints always
 * take an array of tasks and return a matching array of results, but every
 * caller here only ever sends one task).
 */
export async function fetchDataForSeo<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const cacheKey = `${path}:${JSON.stringify(body)}`;
  logger.info(cache.get(cacheKey) !== undefined ? "DataForSEO cache hit" : "DataForSEO cache miss");

  return cache.wrap(cacheKey, async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${BASE}/${path}`, {
        method: "POST",
        headers: {
          Authorization: authHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify([body]),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Upstream error: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      const task = json?.tasks?.[0];
      if (!task || task.status_code >= 40000) {
        throw new Error(task?.status_message ?? "DataForSEO task failed");
      }
      return task.result?.[0] as T;
    } finally {
      clearTimeout(timer);
    }
  }) as Promise<T>;
}
