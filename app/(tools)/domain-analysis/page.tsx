// Rendering: SSR — session-gated; the actual GA/Search Console data is held
// client-side (handed off from /options), so the page itself renders a client dashboard.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DomainAnalysisDashboard } from "@/sections/domain-analysis/dashboard";

export const metadata: Metadata = {
  title: "Domain Analysis",
  robots: { index: false, follow: false },
};

export default async function DomainAnalysisPage() {
  const session = await auth();
  if (!session) redirect("/");

  return <DomainAnalysisDashboard />;
}
