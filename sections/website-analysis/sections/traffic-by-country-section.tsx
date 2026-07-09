/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Globe } from "lucide-react";
import { useSeoTool } from "@/lib/use-seo-tool";
import { SectionCard, DataTable } from "../ui";

export function TrafficByCountrySection({ domain }: { domain: string }) {
  const { loading, error, data } = useSeoTool<any>("traffic-by-country", { domain });
  const countries: { country: string; organicTraffic: number }[] = data?.countries ?? [];

  const totalTraffic = countries.reduce((s, v) => s + v.organicTraffic, 0);
  const rows = [...countries]
    .sort((a, b) => b.organicTraffic - a.organicTraffic)
    .map(({ country, organicTraffic }) => [
      country,
      Math.round(organicTraffic).toLocaleString(),
      totalTraffic > 0 ? `${((organicTraffic / totalTraffic) * 100).toFixed(1)}%` : "—",
    ]);

  return (
    <SectionCard title="Traffic by Country" loading={loading} error={error} icon={<Globe size={15} />}>
      <DataTable headers={["Country", "Organic Traffic", "Share"]} rows={rows} emptyMsg="No country data returned." />
    </SectionCard>
  );
}
