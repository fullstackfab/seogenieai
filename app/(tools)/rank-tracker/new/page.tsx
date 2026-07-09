import type { Metadata } from "next";
import { Suspense } from "react";
import { RankTrackerNewView } from "@/sections/rank-tracker/rank-tracker-new-view";

export const metadata: Metadata = {
  title: "Setting up your Rank Tracker",
  robots: { index: false, follow: false },
};

export default function RankTrackerNewPage() {
  return (
    <Suspense>
      <RankTrackerNewView />
    </Suspense>
  );
}
