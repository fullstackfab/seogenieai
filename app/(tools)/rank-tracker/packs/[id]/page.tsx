// Rendering: SSR — session-gated; loads one Rank Tracker pack + its full history directly from the database.
import type { Metadata } from "next";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { RankTrackerPack } from "@/models/RankTrackerPack";
import { RankSnapshot } from "@/models/RankSnapshot";
import { isPackActive } from "@/lib/rank-tracker/pack-status";
import { PackDetailView } from "@/sections/rank-tracker/pack-detail-view";

export const metadata: Metadata = {
  title: "Rank Tracker",
  robots: { index: false, follow: false },
};

export default async function RankTrackerPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/rank-tracker");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const pack = await RankTrackerPack.findOne({ _id: id, userEmail: session.user.email }).lean();
  if (!pack) notFound();

  const snapshots = await RankSnapshot.find({ packId: pack._id }).sort({ date: 1 }).lean();
  const history: Record<string, { date: string; position: number | null }[]> = {};
  for (const keyword of pack.keywords) history[keyword] = [];
  for (const snap of snapshots) {
    history[snap.keyword]?.push({ date: snap.date.toISOString(), position: snap.position ?? null });
  }

  return (
    <PackDetailView
      id={id}
      domain={pack.domain}
      keywords={pack.keywords}
      purchasedAt={pack.purchasedAt.toISOString()}
      expiresAt={pack.expiresAt.toISOString()}
      active={isPackActive(pack.expiresAt)}
      history={history}
    />
  );
}
