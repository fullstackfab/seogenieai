// Rendering: Client (searchParams-driven) — the audit runs on demand per submitted URL.
import type { Metadata } from "next";
import { Suspense } from "react";
import { AiAuditReportView } from "@/sections/ai-audit/report-view";

export const metadata: Metadata = {
  title: "AI Readiness Report",
  robots: { index: false, follow: false },
};

export default function AiAuditReportPage() {
  return (
    <Suspense>
      <AiAuditReportView />
    </Suspense>
  );
}
