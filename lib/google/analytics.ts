import "server-only";
import { google } from "googleapis";
import type { GoogleAuthClient } from "@/lib/google/oauth-client";
import { buildAnalyticsPayloads, generateDateRanges, type SelectedOption } from "@/lib/google/payloads";
import {
  analyzeSnapshotHeaders,
  calculateTotalGroupingValues,
  collectMatchingRows,
  combineValues,
  titleVisitCountValue,
  type AggregatedRow,
} from "@/lib/google/report-aggregator";
import { getSearchConsoleData } from "@/lib/google/search-console";
import { logger } from "@/lib/logger";

/**
 * GA4 report across all accessible properties, filtered to the requested
 * domain, plus Search Console data. Output shape is identical to the legacy
 * Express google.service.js report.
 */
export async function getGoogleAnalyticsReport(auth: GoogleAuthClient, option: SelectedOption) {
  const admin = google.analyticsadmin({ version: "v1alpha", auth });
  const data = google.analyticsdata({ version: "v1beta", auth });

  const accounts = await admin.accounts.list();
  const accountList = accounts.data.accounts ?? [];
  if (accountList.length < 1) return { noAnalyticsAccountFound: true };

  // Fetch each account's properties in parallel rather than one account at a time.
  const propertyLists = await Promise.all(
    accountList.map((account) => admin.properties.list({ filter: `parent:${account.name}` }))
  );
  const allProperties = propertyLists.flatMap((res) => res.data.properties ?? []);

  const dateRanges = generateDateRanges(option);
  const reference = { providedDomain: option.domain, hasDomainMatch: false };

  const snapshotRows: AggregatedRow[] = [];
  const sessionRows: AggregatedRow[] = [];
  const newUserRows: AggregatedRow[] = [];
  const pageRows: AggregatedRow[] = [];
  const containers = [snapshotRows, sessionRows, newUserRows, pageRows];

  // Run every property's report batch concurrently instead of one property at a
  // time — an account with several GA4 properties no longer pays for each one
  // sequentially. Row collection stays correct: each property's results are
  // processed synchronously once its own batch settles, so pushes into the
  // shared containers/reference never interleave mid-mutation. Search Console
  // doesn't depend on the GA4 results, so it runs alongside them rather than after.
  const [, searchConsoleData] = await Promise.all([
    Promise.all(
      allProperties.map(async (property) => {
        const propertyId = property.name?.substring(property.name.lastIndexOf("/") + 1);
        if (!propertyId) return;
        const payloads = buildAnalyticsPayloads(dateRanges);
        const responses = await Promise.allSettled(
          payloads.map((requestBody) =>
            data.properties.runReport({ property: `properties/${propertyId}`, requestBody })
          )
        );
        responses.forEach((result, i) => {
          if (result.status === "fulfilled") {
            collectMatchingRows(
              result.value.data as Parameters<typeof collectMatchingRows>[0],
              containers[i],
              reference
            );
          } else {
            logger.warn("GA4 runReport failed for a property", { index: i });
          }
        });
      })
    ),
    getSearchConsoleData(auth, option.domain, dateRanges[0]),
  ]);

  if (!reference.hasDomainMatch) return { noMatchFoundForDomain: true };

  const [snapshotHeaderValues, countryWiseUsers] = analyzeSnapshotHeaders(snapshotRows);
  const pageReportPerPageCountValues = combineValues(pageRows);

  return {
    snapshotHeaderValues,
    newUserGroupingValues: calculateTotalGroupingValues(newUserRows),
    sessionGroupingValues: calculateTotalGroupingValues(sessionRows),
    countryWiseUsers,
    pageReportPerPageCountValues,
    titleWiseVisitCountValues: titleVisitCountValue(pageReportPerPageCountValues),
    searchConsoleData,
  };
}
