// Rendering: SSG shell — client leaf runs PageSpeed on demand for the domain from the home search.
import type { Metadata } from "next";
import { Suspense } from "react";
import { InsightView } from "@/sections/insight/insight-view";

export const metadata: Metadata = {
  title: "Website Speed Insight",
  description: "Check your website's PageSpeed Insights score for desktop and mobile.",
  robots: { index: false, follow: false },
};

export default function InsightPage() {
  return (
    <Suspense>
      <InsightView />
    </Suspense>
  );
}
