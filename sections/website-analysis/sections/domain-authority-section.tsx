/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Layers } from "lucide-react";
import { useSeoTool } from "@/lib/use-seo-tool";
import { SectionCard } from "../ui";

const scoreLabel = (s: number) =>
  s >= 70 ? "Excellent authority" : s >= 50 ? "Good authority" : s >= 30 ? "Moderate authority" : "Building authority";

export function DomainAuthoritySection({ domain }: { domain: string }) {
  const { loading, error, data } = useSeoTool<any>("domain-authority", { domain });
  const score = data?.domainAuthority;
  const domainName = data?.domain;

  return (
    <SectionCard title="Domain Authority" loading={loading} error={error} icon={<Layers size={15} />}>
      {score != null ? (
        <div className="flex items-center gap-5">
          <div className="shrink-0 w-20 h-20 flex flex-col items-center justify-center rounded-[10px] border-2 border-black/10">
            <span className="text-3xl font-bold text-dark-100 leading-none">{score}</span>
            <span className="text-[9px] font-semibold uppercase tracking-widest opacity-40 mt-1">/ 100</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-dark-100">{domainName}</p>
            <p className="text-xs opacity-50 mt-0.5">{scoreLabel(score)}</p>
            <div className="mt-3 w-48 h-2 bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-dark-100 rounded-full transition-all duration-700" style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm opacity-50 py-2">No authority data returned.</p>
      )}
    </SectionCard>
  );
}
