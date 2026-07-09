/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Link2 } from "lucide-react";
import { useSeoTool } from "@/lib/use-seo-tool";
import { SectionCard, StatRow, DataTable } from "../ui";

export function BacklinksSection({ domain }: { domain: string }) {
  const { loading, error, data } = useSeoTool<any>("backlinks", { domain });
  const raw = data ?? {};

  const stats = [
    { label: "Total Backlinks", value: raw.totalBacklinks?.toLocaleString() },
    { label: "Referring Domains", value: raw.referringDomains?.toLocaleString() },
    { label: "Referring Pages", value: raw.referringPages?.toLocaleString() },
    { label: "Referring IPs", value: raw.referringIPs?.toLocaleString() },
    { label: "Domain Authority", value: raw.domainAuthority != null ? String(raw.domainAuthority) : undefined },
    { label: "Spam Score", value: raw.spamScore != null ? String(raw.spamScore) : undefined },
    { label: "Broken Backlinks", value: raw.brokenBacklinks?.toLocaleString() },
  ];
  const tldRows = Object.entries(raw.tldDistribution ?? {})
    .sort((a: any, b: any) => b[1] - a[1])
    .map(([t, c]) => [`.${t}`, (c as number).toLocaleString()]);
  const attrRows = Object.entries(raw.linkAttributes ?? {})
    .sort((a: any, b: any) => b[1] - a[1])
    .map(([a, c]) => [a, (c as number).toLocaleString()]);

  return (
    <SectionCard title="Backlinks" loading={loading} error={error} icon={<Link2 size={15} />}>
      <StatRow stats={stats} />
      {(tldRows.length > 0 || attrRows.length > 0) && (
        <div className="mt-6 flex flex-wrap gap-6">
          {tldRows.length > 0 && (
            <div className="flex-1 min-w-[160px]">
              <h3 className="text-sm font-semibold text-dark-100 mb-3">TLD Distribution</h3>
              <DataTable headers={["TLD", "Count"]} rows={tldRows} emptyMsg="" />
            </div>
          )}
          {attrRows.length > 0 && (
            <div className="flex-1 min-w-[160px]">
              <h3 className="text-sm font-semibold text-dark-100 mb-3">Link Attributes</h3>
              <DataTable headers={["Attribute", "Count"]} rows={attrRows} emptyMsg="" />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
