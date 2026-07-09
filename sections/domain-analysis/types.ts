/** Row shape from lib/google/report-aggregator.ts titleVisitCountValue/combineValues. */
export type PageRow = [
  string, // path
  string, // title
  string, // domain
  string, // country
  { screenPageViews: string },
  { activeUsers: string },
  { newUsers: string },
  { sessions: string },
];

export type SearchConsoleRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchConsoleData = Partial<
  Record<"query" | "page" | "date" | "country" | "device" | "search_appearance", SearchConsoleRow[]>
>;
