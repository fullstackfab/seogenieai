import "server-only";

export type DateRange = { startDate: string; endDate: string };

export type SelectedOption = {
  domain: string;
  oneDayAgo?: boolean;
  oneWeekAgo?: boolean;
  oneMonthAgo?: boolean;
  compareDates?: boolean;
  value?: { startDate: string; endDate: string };
};

const COMMON_DIMENSIONS = [{ name: "country" }, { name: "hostName" }];

/**
 * GA4 runReport payload batch (ported from data/analytics-payload.js).
 * Order matters — the aggregator destructures responses positionally.
 * Built fresh per call: the legacy code mutated a shared module constant.
 */
export function buildAnalyticsPayloads(dateRanges: DateRange[]) {
  return [
    {
      metrics: [
        { name: "totalUsers" },
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "userEngagementDuration" },
        { name: "totalRevenue" },
      ],
      dimensions: COMMON_DIMENSIONS,
      dateRanges,
    },
    {
      metrics: [{ name: "sessions" }],
      dimensions: [...COMMON_DIMENSIONS, { name: "sessionDefaultChannelGroup" }],
      dateRanges,
    },
    {
      metrics: [{ name: "newUsers" }],
      dimensions: [...COMMON_DIMENSIONS, { name: "sessionDefaultChannelGroup" }],
      dateRanges,
    },
    {
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
      ],
      dimensions: [
        { name: "pagePath" },
        { name: "pageTitle" },
        { name: "hostName" },
        { name: "country" },
      ],
      dateRanges,
    },
  ];
}

export function generateDateRanges(option: SelectedOption): DateRange[] {
  const ranges: DateRange[] = [];
  const today = new Date();
  const iso = (d: Date) => d.toISOString().split("T")[0];

  if (option.oneDayAgo) {
    const d = new Date(today);
    d.setDate(today.getDate() - 1);
    ranges.push({ startDate: iso(d), endDate: iso(today) });
  }
  if (option.oneWeekAgo) {
    const d = new Date(today);
    d.setDate(today.getDate() - 7);
    ranges.push({ startDate: iso(d), endDate: iso(today) });
  }
  if (option.oneMonthAgo) {
    const d = new Date(today);
    d.setMonth(today.getMonth() - 1);
    ranges.push({ startDate: iso(d), endDate: iso(today) });
  }
  if (option.compareDates && option.value) {
    ranges.push({
      startDate: String(option.value.startDate),
      endDate: String(option.value.endDate),
    });
  }
  return ranges;
}
