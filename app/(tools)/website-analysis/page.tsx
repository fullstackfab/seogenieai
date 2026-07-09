// Rendering: SSG shell — client dashboard fetches each SEO tool on demand for the domain from the home search.
import type { Metadata } from "next";
import { WebsiteAnalysisDashboard } from "@/sections/website-analysis/dashboard";

export const metadata: Metadata = {
  title: "Website Analysis",
  description: "Complete website SEO and traffic analysis: authority, backlinks, competitors, AI visibility.",
  alternates: { canonical: "/website-analysis" },
};

export default function WebsiteAnalysisPage() {
  return <WebsiteAnalysisDashboard />;
}
