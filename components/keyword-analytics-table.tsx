"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { toCsv, downloadCsv } from "@/lib/csv";

type MonthlySearch = { year: number; month: number; search_volume?: number };
type SearchVolumeTrend = { monthly?: number; quarterly?: number; yearly?: number };

type KeywordItem = {
  keyword: string;
  search_intent?: string;
  avg_search_volume?: number;
  cpc?: number;
  competition_level?: string;
  low_top_of_page_bid?: number;
  high_top_of_page_bid?: number;
  search_volume_trend?: SearchVolumeTrend;
  keyword_difficulty?: number | string;
  serp_statistics?: { se_results_count?: number };
  monthly_searches?: MonthlySearch[];
};

const formatMonth = (year: number, month: number) =>
  new Date(year, month - 1).toLocaleString("default", { month: "short" });

const formatMoney = (value: number | undefined) => (typeof value === "number" ? `$${value}` : "—");

const formatTrend = (value: number | undefined) =>
  typeof value === "number" ? `${value > 0 ? "+" : ""}${value}%` : "—";

const COMPETITION_STYLES: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-emerald-100 text-emerald-700",
};

function CompetitionBadge({ level }: { level?: string }) {
  if (!level) return <span>—</span>;
  const style = COMPETITION_STYLES[level.toUpperCase()] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
      {level.toLowerCase()}
    </span>
  );
}

const CSV_HEADERS = [
  "Keyword",
  "Search Intent",
  "Search Volume",
  "CPC",
  "Low Top of Page Bid",
  "High Top of Page Bid",
  "Competition Level",
  "Keyword Difficulty",
  "Monthly Trend (%)",
  "Quarterly Trend (%)",
  "Yearly Trend (%)",
  "SERP Results Count",
];

function toCsvRow(item: KeywordItem) {
  return [
    item.keyword,
    item.search_intent ?? "",
    item.avg_search_volume ?? "",
    item.cpc ?? "",
    item.low_top_of_page_bid ?? "",
    item.high_top_of_page_bid ?? "",
    item.competition_level ?? "",
    item.keyword_difficulty ?? "",
    item.search_volume_trend?.monthly ?? "",
    item.search_volume_trend?.quarterly ?? "",
    item.search_volume_trend?.yearly ?? "",
    item.serp_statistics?.se_results_count ?? "",
  ];
}

export function KeywordAnalyticsTable({ keywords = [] }: { keywords: KeywordItem[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<KeywordItem | null>(null);

  const filtered = useMemo(
    () => keywords.filter((item) => item.keyword?.toLowerCase().includes(search.toLowerCase())),
    [keywords, search]
  );

  function handleDownload() {
    if (filtered.length === 0) return;
    const csv = toCsv(CSV_HEADERS, filtered.map(toCsvRow));
    downloadCsv(`keyword-research-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold">Keyword Analytics</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search keyword..."
              value={search}
              aria-label="Search keyword"
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-xl px-4 py-2 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Download CSV"
              disabled={filtered.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-dark-100 text-white transition-colors duration-200 hover:bg-dark-100/90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Keyword</th>
                <th className="px-4 py-3 text-left">Intent</th>
                <th className="px-4 py-3 text-left">Avg Volume</th>
                <th className="px-4 py-3 text-left">CPC</th>
                <th className="px-4 py-3 text-left">Competition</th>
                <th className="px-4 py-3 text-left">Difficulty</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {keywords.length === 0
                      ? "No keywords found for this search. Try a different or broader keyword."
                      : "No keywords match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{item.keyword}</td>
                    <td className="px-4 py-3 capitalize">{item.search_intent ?? "—"}</td>
                    <td className="px-4 py-3">{item.avg_search_volume?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3">{formatMoney(item.cpc)}</td>
                    <td className="px-4 py-3">
                      <CompetitionBadge level={item.competition_level} />
                    </td>
                    <td className="px-4 py-3">{item.keyword_difficulty ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(item)}
                        aria-label={`View details for ${item.keyword}`}
                        className="px-3 py-1 text-xs bg-dark-100 rounded-[9px] border border-dark-100 transition-colors duration-300 whitespace-nowrap text-white hover:bg-transparent hover:text-dark-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} contentLabel="Keyword detail">
        {selected && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Keyword: {selected.keyword}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-gray-500">Avg Volume</p>
                <p className="font-semibold">
                  {selected.avg_search_volume?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">CPC</p>
                <p className="font-semibold">{formatMoney(selected.cpc)}</p>
              </div>
              <div>
                <p className="text-gray-500">Difficulty</p>
                <p className="font-semibold">{selected.keyword_difficulty ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">SERP Results</p>
                <p className="font-semibold">
                  {selected.serp_statistics?.se_results_count?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Competition</p>
                <p className="font-semibold">
                  <CompetitionBadge level={selected.competition_level} />
                </p>
              </div>
              <div>
                <p className="text-gray-500">Low Top-of-Page Bid</p>
                <p className="font-semibold">{formatMoney(selected.low_top_of_page_bid)}</p>
              </div>
              <div>
                <p className="text-gray-500">High Top-of-Page Bid</p>
                <p className="font-semibold">{formatMoney(selected.high_top_of_page_bid)}</p>
              </div>
            </div>

            {selected.search_volume_trend && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Search Volume Trend</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500">Monthly</p>
                    <p className="font-semibold text-base">
                      {formatTrend(selected.search_volume_trend.monthly)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500">Quarterly</p>
                    <p className="font-semibold text-base">
                      {formatTrend(selected.search_volume_trend.quarterly)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-gray-500">Yearly</p>
                    <p className="font-semibold text-base">
                      {formatTrend(selected.search_volume_trend.yearly)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selected.monthly_searches && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Monthly Search Volume</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Month</th>
                        <th className="px-4 py-2 text-left">Year</th>
                        <th className="px-4 py-2 text-left">Search Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selected.monthly_searches.map((m, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2">{formatMonth(m.year, m.month)}</td>
                          <td className="px-4 py-2">{m.year}</td>
                          <td className="px-4 py-2 font-medium">
                            {m.search_volume?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
