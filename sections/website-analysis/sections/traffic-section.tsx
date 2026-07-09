/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TrendingUp } from "lucide-react";
import { useSeoTool } from "@/lib/use-seo-tool";
import { SectionCard, StatRow } from "../ui";

export function TrafficSection({ domain }: { domain: string }) {
  const { loading, error, data } = useSeoTool<any>("traffic", { domain });

  const stats = [
    { label: "Organic Traffic", value: data?.organicTraffic != null ? Math.round(data.organicTraffic).toLocaleString() : undefined },
    { label: "Paid Traffic", value: data?.paidTraffic != null ? Math.round(data.paidTraffic).toLocaleString() : undefined },
    { label: "Paid Traffic Cost", value: data?.paidTrafficCost != null ? `$${Math.round(data.paidTrafficCost).toLocaleString()}` : undefined },
  ];

  return (
    <SectionCard title="Website Traffic" loading={loading} error={error} icon={<TrendingUp size={15} />}>
      <StatRow stats={stats} />
    </SectionCard>
  );
}
