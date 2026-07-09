/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Activity } from "lucide-react";
import { useSeoTool } from "@/lib/use-seo-tool";
import { SectionCard, DataTable } from "../ui";

export function TrafficHistorySection({ domain }: { domain: string }) {
  const { loading, error, data } = useSeoTool<any>("traffic-history", { domain });
  const rows = (data?.history ?? []).map((r: any) => [
    r.period ?? "—",
    r.organicTraffic != null ? Math.round(r.organicTraffic).toLocaleString() : "—",
    r.paidTraffic != null ? Math.round(r.paidTraffic).toLocaleString() : "—",
  ]);

  return (
    <SectionCard title="Traffic History" loading={loading} error={error} icon={<Activity size={15} />}>
      <DataTable headers={["Period", "Organic Traffic", "Paid Traffic"]} rows={rows} emptyMsg="No traffic history available." />
    </SectionCard>
  );
}
