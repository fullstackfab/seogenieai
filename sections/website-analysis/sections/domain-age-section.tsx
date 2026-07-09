/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Calendar } from "lucide-react";
import { useSeoTool } from "@/lib/use-seo-tool";
import { SectionCard, StatRow } from "../ui";

export function DomainAgeSection({ domain }: { domain: string }) {
  const { loading, error, data } = useSeoTool<any>("domain-age", { domain });
  const createdDate = data?.registrationDate;

  let ageLabel: string | undefined;
  if (createdDate) {
    const now = new Date();
    const created = new Date(createdDate);
    const totalMonths = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
    ageLabel =
      totalMonths >= 12
        ? `${Math.floor(totalMonths / 12)} yr${Math.floor(totalMonths / 12) !== 1 ? "s" : ""} ${totalMonths % 12} mo`
        : `${totalMonths} month${totalMonths !== 1 ? "s" : ""}`;
  }

  const stats = [
    { label: "Domain Age", value: ageLabel },
    { label: "Created", value: createdDate },
    { label: "Changed", value: data?.changeDate },
    { label: "Last Updated", value: data?.lastUpdate },
    { label: "Expiration", value: data?.expiryDate },
  ];

  return (
    <SectionCard title="Domain Age & Registration" loading={loading} error={error} icon={<Calendar size={15} />}>
      <StatRow stats={stats} />
    </SectionCard>
  );
}
