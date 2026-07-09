// Rendering: SSR — session-gated; lists this user's Rank Tracker packs.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { RankTrackerPack } from "@/models/RankTrackerPack";
import { isPackActive } from "@/lib/rank-tracker/pack-status";
import { PacksList } from "@/sections/rank-tracker/packs-list";

export const metadata: Metadata = {
  title: "My Rank Trackers",
  robots: { index: false, follow: false },
};

export default async function RankTrackerPacksPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/rank-tracker");

  await dbConnect();
  const docs = await RankTrackerPack.find({ userEmail: session.user.email })
    .sort({ purchasedAt: -1 })
    .lean();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    domain: doc.domain,
    keywordCount: doc.keywords.length,
    purchasedAt: doc.purchasedAt.toISOString(),
    expiresAt: doc.expiresAt.toISOString(),
    active: isPackActive(doc.expiresAt),
  }));

  return <PacksList items={items} />;
}
