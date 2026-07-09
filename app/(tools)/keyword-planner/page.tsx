// Rendering: SSG shell — fully client-driven form + results table, no request-time data.
import type { Metadata } from "next";
import { KeywordPlannerView } from "@/sections/keyword-planner/keyword-planner-view";

export const metadata: Metadata = {
  title: "Keyword Planner",
  description: "Plan and research keywords for your digital ad campaigns with SEOGenieAI.",
  alternates: { canonical: "/keyword-planner" },
};

export default function KeywordPlannerPage() {
  return <KeywordPlannerView />;
}
