import "server-only";

/* Aggregation helpers ported 1:1 from the legacy google.service.js so the
 * report shape consumed by the domain-analysis dashboard stays identical. */

type DimensionValue = { value: string };
type NamedMetric = { name: string; value: string };
export type AggregatedRow = { dimensionValues: DimensionValue[]; metricValues: NamedMetric[] };

type RunReportResponse = {
  rows?: { dimensionValues: DimensionValue[]; metricValues: { value: string }[] }[];
  metricHeaders?: { name: string }[];
};

export function formatHostname(hostname: string): string {
  return hostname
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function areDimensionValuesEqual(a: DimensionValue[], b: DimensionValue[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((d, i) => d.value.toLowerCase() === b[i].value.toLowerCase());
}

/** Collects rows whose hostName dimension matches the requested domain. */
export function collectMatchingRows(
  response: RunReportResponse,
  container: AggregatedRow[],
  reference: { providedDomain: string; hasDomainMatch: boolean }
): void {
  if (!response.rows) return;
  const target = formatHostname(reference.providedDomain);
  for (const row of response.rows) {
    const matches = row.dimensionValues.some((d) => formatHostname(d.value) === target);
    if (!matches) continue;
    reference.hasDomainMatch = true;
    const headerNames = (response.metricHeaders ?? []).map((h) => h.name);
    const metricArray = row.metricValues.map((m, i) => ({ name: headerNames[i], value: m.value }));
    const existing = container.findIndex((entry) =>
      areDimensionValuesEqual(entry.dimensionValues, row.dimensionValues)
    );
    if (existing !== -1) container[existing].metricValues.push(...metricArray);
    else container.push({ dimensionValues: row.dimensionValues, metricValues: metricArray });
  }
}

export function analyzeSnapshotHeaders(rows: AggregatedRow[]) {
  const totals: Record<string, number> = {
    activeUsers: 0,
    newUsers: 0,
    userEngagementDuration: 0,
    totalRevenue: 0,
  };
  const countryWiseUsers: Record<string, number> = {};

  for (const data of rows) {
    const country = data.dimensionValues[0].value;
    for (const { name, value } of data.metricValues) {
      if (name in totals) totals[name] += Number(value);
      countryWiseUsers[country] = Number(data.metricValues[0].value);
    }
  }

  const minutes = totals.userEngagementDuration / (60 * (totals.activeUsers || 1));
  const [m, s] = minutes.toFixed(2).split(".");
  const snapshot: Record<string, number | string> = {
    activeUsers: totals.activeUsers,
    newUsers: totals.newUsers,
    averageEngagementTime: `${m}m ${s.slice(0, 2)}s`,
    totalRevenue: `$${totals.totalRevenue.toFixed(2)}`,
  };
  return [snapshot, countryWiseUsers] as const;
}

export function calculateTotalGroupingValues(rows: AggregatedRow[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const data of rows) {
    const grouping = data.dimensionValues[2].value;
    totals[grouping] = (totals[grouping] ?? 0) + Number(data.metricValues[0].value);
  }
  return totals;
}

type CombinedRow = (string | Record<string, string>)[];

export function combineValues(rows: AggregatedRow[]): CombinedRow[] {
  return rows.map((item) => [
    ...item.dimensionValues.map((d) => d.value),
    ...item.metricValues.map((m): Record<string, string> => ({ [m.name]: m.value })),
  ]);
}

export function titleVisitCountValue(rows: CombinedRow[]): CombinedRow[] {
  const result: Record<
    string,
    {
      path: string;
      domain: string;
      country: string;
      screenPageViews: number;
      activeUsers: number;
      newUsers: number;
      sessions: number;
    }
  > = {};

  for (const entry of rows) {
    const [path, title, domain, country, screenPageViews, activeUsers, newUsers, sessions] =
      entry as [
        string,
        string,
        string,
        string,
        Record<string, string>,
        Record<string, string>,
        Record<string, string>,
        Record<string, string>,
      ];
    if (!result[title]) {
      result[title] = {
        path,
        domain,
        country,
        screenPageViews: 0,
        activeUsers: 0,
        newUsers: 0,
        sessions: 0,
      };
    }
    result[title].screenPageViews += parseInt(screenPageViews.screenPageViews, 10);
    result[title].activeUsers += parseInt(activeUsers.activeUsers, 10);
    result[title].newUsers += parseInt(newUsers.newUsers, 10);
    result[title].sessions += parseInt(sessions.sessions, 10);
  }

  return Object.entries(result).map(
    ([title, v]): CombinedRow => [
      v.path,
      title,
      v.domain,
      v.country,
      { screenPageViews: String(v.screenPageViews) },
      { activeUsers: String(v.activeUsers) },
      { newUsers: String(v.newUsers) },
      { sessions: String(v.sessions) },
    ]
  );
}
