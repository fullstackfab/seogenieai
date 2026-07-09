import "server-only";
import { google } from "googleapis";
import type { GoogleAuthClient } from "@/lib/google/oauth-client";
import type { DateRange } from "@/lib/google/payloads";
import { logger } from "@/lib/logger";

const DIMENSIONS = ["query", "page", "date", "country", "device", "search_appearance"];

function extractDomainName(url: string): string {
  return url
    .replace(/(^\w+:|^)\/\//, "")
    .replace(/^www\./, "")
    .split(".")[0];
}

type SiteEntry = { siteUrl?: string | null; permissionLevel?: string | null };

/** Picks the verified Search Console property matching the analysed domain. */
function resolveSiteUrl(siteUrl: string, sites: SiteEntry[]): string {
  const exact = sites.find((s) => s.siteUrl?.includes(siteUrl));
  if (exact?.siteUrl) return exact.siteUrl;
  const domainName = extractDomainName(siteUrl);
  for (const site of sites) {
    if (
      site.siteUrl?.includes(domainName) &&
      (site.permissionLevel === "siteOwner" || site.permissionLevel === "siteFullUser")
    ) {
      return site.siteUrl;
    }
  }
  return siteUrl;
}

/** One search-analytics query per dimension, keyed by dimension name. */
export async function getSearchConsoleData(
  auth: GoogleAuthClient,
  siteUrl: string,
  dateRange: DateRange
): Promise<Record<string, unknown[]> | []> {
  try {
    const searchConsole = google.searchconsole({ version: "v1", auth });
    const listed = await searchConsole.sites.list();
    const resolved = resolveSiteUrl(siteUrl, listed.data.siteEntry ?? []);

    const results = await Promise.allSettled(
      DIMENSIONS.map((dimension) =>
        searchConsole.searchanalytics.query({
          siteUrl: resolved,
          requestBody: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            dimensions: [dimension],
          },
        })
      )
    );

    const grouped: Record<string, unknown[]> = {};
    results.forEach((result, i) => {
      grouped[DIMENSIONS[i]] =
        result.status === "fulfilled" ? (result.value.data.rows ?? []) : [];
    });
    return grouped;
  } catch (err) {
    logger.error("Search Console fetch failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return [];
  }
}
