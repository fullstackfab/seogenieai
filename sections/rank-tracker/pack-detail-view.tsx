"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Minus, Trash2, LineChart, Search } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { useToast } from "@/providers/toast-provider";
import { daysRemaining } from "@/lib/rank-tracker/pack-status";

const chartLoading = <div className="bg-white rounded-2xl h-[300px] animate-pulse" />;
const RankTrendChart = dynamic(
  () => import("./rank-trend-chart").then((m) => m.RankTrendChart),
  { ssr: false, loading: () => chartLoading }
);

type HistoryEntry = { date: string; position: number | null };

export function PackDetailView({
  id,
  domain,
  keywords,
  purchasedAt,
  expiresAt,
  active,
  history,
}: {
  id: string;
  domain: string;
  keywords: string[];
  purchasedAt: string;
  expiresAt: string;
  active: boolean;
  history: Record<string, HistoryEntry[]>;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [selectedKeyword, setSelectedKeyword] = useState(keywords[0] ?? "");
  const [stopping, setStopping] = useState(false);

  const daysLeft = daysRemaining(expiresAt);

  async function stopTracking() {
    if (!window.confirm("Stop tracking this domain? This can't be undone.")) return;
    setStopping(true);
    try {
      const res = await fetch(`/api/rank-tracker/packs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showSuccess("Stopped tracking.");
      router.refresh();
    } catch {
      showError("Couldn't stop tracking. Please try again.");
    } finally {
      setStopping(false);
    }
  }

  return (
    <Container>
      <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
        <BackToHome heading="My Rank Trackers" link="/rank-tracker/packs" />
        <Link
          href="/rank-tracker"
          className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Track another domain
        </Link>
      </Wrapper>

      <Wrapper className="flex items-center gap-2 flex-wrap mb-4 text-sm text-[#64748b]">
        <span
          className={`px-2.5 py-1 rounded-full font-medium ${
            active ? "bg-green-500/10 text-green-600" : "bg-black/5 text-gray-500"
          }`}
        >
          {active ? `${daysLeft} days left` : "Expired"}
        </span>
        <span>·</span>
        <span>Started {new Date(purchasedAt).toLocaleDateString()}</span>
      </Wrapper>
      <h1 className="text-[#171717] text-2xl font-bold mb-6 max-w-160">{domain}</h1>

      <Wrapper className="bg-white rounded-2xl shadow-6xl p-6 mb-6 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 pr-4 font-medium">Keyword</th>
              <th className="py-2 pr-4 font-medium">Position</th>
              <th className="py-2 pr-4 font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((keyword) => {
              const entries = history[keyword] ?? [];
              const latest = entries[entries.length - 1];
              const previous = entries[entries.length - 2];
              const current = latest?.position ?? null;
              const diff =
                latest?.position != null && previous?.position != null
                  ? previous.position - latest.position
                  : null;
              const isSelected = keyword === selectedKeyword;

              return (
                <tr
                  key={keyword}
                  onClick={() => setSelectedKeyword(keyword)}
                  className={`cursor-pointer border-b border-gray-50 last:border-0 hover:bg-lightblue-100/30 transition-colors ${
                    isSelected ? "bg-lightblue-100/50" : ""
                  }`}
                >
                  <td className="py-3 pr-4 font-medium text-[#171717]">{keyword}</td>
                  <td className="py-3 pr-4 text-dark-100 font-semibold">
                    {current !== null ? `#${current}` : "Not in top 30"}
                  </td>
                  <td className="py-3 pr-4">
                    {diff === null ? (
                      <span className="text-gray-300">—</span>
                    ) : diff > 0 ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" aria-hidden="true" />+{diff}
                      </span>
                    ) : diff < 0 ? (
                      <span className="flex items-center gap-1 text-red-500">
                        <TrendingDown className="w-4 h-4" aria-hidden="true" />
                        {diff}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Minus className="w-4 h-4" aria-hidden="true" />
                        0
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Wrapper>

      {selectedKeyword && (
        <Wrapper className="bg-white rounded-2xl shadow-6xl p-6 mb-6">
          <h2 className="text-base font-bold text-dark-100 mb-4 flex items-center gap-2">
            <LineChart className="w-4 h-4" aria-hidden="true" />
            {selectedKeyword}
          </h2>
          {(history[selectedKeyword]?.length ?? 0) > 0 ? (
            <RankTrendChart history={history[selectedKeyword] ?? []} />
          ) : (
            <p className="text-sm text-gray-400">No data yet — check back after the next daily check.</p>
          )}
        </Wrapper>
      )}

      {active && (
        <Wrapper className="mb-16">
          <button
            onClick={stopTracking}
            disabled={stopping}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            {stopping ? "Stopping…" : "Stop Tracking"}
          </button>
        </Wrapper>
      )}
    </Container>
  );
}
