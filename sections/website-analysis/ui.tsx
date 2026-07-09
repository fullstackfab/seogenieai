"use client";

import { useState, type ReactNode } from "react";

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8">
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-dark-100 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 bg-dark-100 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 bg-dark-100 rounded-full animate-bounce" />
      </div>
      <span className="text-sm text-black opacity-50">{label}</span>
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  children,
  loading,
  error,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="bg-white rounded-[10px] border-2 border-black/10 mb-5 overflow-hidden">
      <div className="px-6 py-4 border-b-2 border-black/10 flex items-center gap-2">
        {icon && <span className="text-dark-100">{icon}</span>}
        <h2 className="text-base font-semibold text-dark-100">{title}</h2>
      </div>
      <div className="px-6 py-5">
        {loading && <Loader />}
        {!loading && error && <p className="text-sm text-red-500 py-2">{error}</p>}
        {!loading && !error && children}
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="border-2 border-black/10 rounded-[10px] px-5 py-4 flex-1 min-w-[140px]">
      <span className="block text-[11px] font-semibold uppercase tracking-widest opacity-50 mb-1">
        {label}
      </span>
      <span className="block text-2xl font-bold text-dark-100 truncate">{value}</span>
    </div>
  );
}

export function StatRow({ stats }: { stats: { label: string; value?: string | number | null }[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => (
        <Stat key={s.label} label={s.label} value={s.value} />
      ))}
    </div>
  );
}

export function DataTable({
  headers,
  rows,
  emptyMsg = "No data.",
}: {
  headers: string[];
  rows: (string | number | null | undefined)[][];
  emptyMsg?: string;
}) {
  const [limit, setLimit] = useState(10);
  if (!rows?.length) return <p className="text-sm opacity-50 py-4">{emptyMsg}</p>;
  const shown = rows.slice(0, limit);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black/10">
              {headers.map((h) => (
                <th key={h} className="text-left font-semibold text-dark-100 py-2 pr-4 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <tr key={i} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 pr-4 text-black/80 max-w-[260px] truncate align-top">
                    {cell ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <button
          onClick={() => setLimit((l) => l + 20)}
          className="mt-3 text-sm font-semibold text-dark-100 underline underline-offset-4"
        >
          Show more ({rows.length - limit} remaining)
        </button>
      )}
      {limit > 10 && rows.length <= limit && rows.length > 10 && (
        <button
          onClick={() => setLimit(10)}
          className="mt-3 text-sm font-semibold text-dark-100 underline underline-offset-4"
        >
          Show less
        </button>
      )}
    </div>
  );
}
