"use client";

import { useState } from "react";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SearchConsoleData } from "./types";

countries.registerLocale(en);

const TABS = [
  { name: "QUERIES", id: "query" },
  { name: "PAGES", id: "page" },
  { name: "COUNTRIES", id: "country" },
  { name: "DEVICES", id: "device" },
  { name: "SEARCH APPEARANCE", id: "search_appearance" },
  { name: "DATES", id: "date" },
] as const;

const PAGE_SIZE = 5;

/** Search Console query/page/country/device/appearance/date breakdown, tabbed. */
export function SearchConsoleTable({ values }: { values: SearchConsoleData }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("query");
  const [page, setPage] = useState(0);

  const data = values?.[activeTab] ?? [];
  const start = page * PAGE_SIZE;
  const rows = data.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  return (
    <div className="bg-white p-6 rounded-xl min-h-[300px]">
      <div className="w-full flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(0);
            }}
            className={`flex-grow cursor-pointer py-2 text-[12px] font-semibold text-center transition-all duration-200 ${
              activeTab === tab.id
                ? "font-bold text-black border-b-2 border-slate-600"
                : "text-gray-600 hover:bg-gray-200 rounded-md"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {rows.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-12 gap-2 font-bold border-b text-[12px] pb-2 text-gray-700">
              <div className="px-2 col-span-8 text-[12px]">
                {TABS.find((t) => t.id === activeTab)?.name}
              </div>
              <div className="col-span-1 text-[12px] text-center">Clicks</div>
              <div className="col-span-1 text-[12px] text-center">Impressions</div>
              <div className="col-span-1 text-[12px] text-center">Position</div>
              <div className="col-span-1 text-[12px] text-center">CTR (%)</div>
            </div>
            {rows.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 py-2 border-b text-[12px] text-gray-800 hover:bg-slate-100"
              >
                <div className="font-semibold px-2 col-span-8 text-[12px]">
                  {activeTab === "country"
                    ? countries.getName(item.keys[0].toUpperCase(), "en") || item.keys[0]
                    : item.keys[0]}
                </div>
                <div className="text-blue-600 font-semibold col-span-1 text-center">{item.clicks}</div>
                <div className="text-red-500 font-semibold col-span-1 text-center">{item.impressions}</div>
                <div className="text-green-500 font-semibold col-span-1 text-center">
                  {item.position.toFixed(1)}
                </div>
                <div className="text-yellow-500 font-semibold col-span-1 text-center">
                  {(item.ctr * 100).toFixed(2)}%
                </div>
              </div>
            ))}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">
                {start + 1}-{start + rows.length} of {data.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-md disabled:text-slate-300 hover:bg-gray-100"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-md disabled:text-slate-300 hover:bg-gray-100"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600">No data available.</div>
      )}
    </div>
  );
}
