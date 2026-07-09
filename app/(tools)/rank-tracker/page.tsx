import type { Metadata } from "next";
import { RankTrackerView } from "@/sections/rank-tracker/rank-tracker-view";

export const metadata: Metadata = {
  title: "Rank Tracker",
  description: "Track your Google keyword rankings daily and see trends over time.",
  robots: { index: false, follow: false },
};

export default function RankTrackerPage() {
  return <RankTrackerView />;
}
