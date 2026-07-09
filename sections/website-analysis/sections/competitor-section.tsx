/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Users } from "lucide-react";
import { useSeoTool } from "@/lib/use-seo-tool";
import { SectionCard, DataTable } from "../ui";

export function CompetitorSection({ domain }: { domain: string }) {
  const { loading, error, data } = useSeoTool<any>("competitor-analysis", { domain });
  const competitors = data?.competitors ?? [];
  const rows = competitors
    .slice(0, 30)
    .map((c: any) => [
      c.domain ?? "—",
      c.organicTraffic != null ? Math.round(c.organicTraffic).toLocaleString() : "—",
      c.commonKeywords?.toLocaleString() ?? "—",
    ]);

  return (
    <SectionCard title="Competitor Analysis" loading={loading} error={error} icon={<Users size={15} />}>
      <DataTable headers={["Competitor", "Organic Traffic", "Common Keywords"]} rows={rows} emptyMsg="No competitor data returned." />
    </SectionCard>
  );
}
