import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { RankTrackerPack } from "@/models/RankTrackerPack";
import { RankSnapshot } from "@/models/RankSnapshot";
import { isSameOrigin } from "@/lib/csrf";
import { logger } from "@/lib/logger";

/** One pack's detail + full rank history per keyword, owner-scoped. */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await dbConnect();
    const pack = await RankTrackerPack.findOne({ _id: id, userEmail: session.user.email }).lean();
    if (!pack) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const snapshots = await RankSnapshot.find({ packId: pack._id }).sort({ date: 1 }).lean();
    const history: Record<string, { date: string; position: number | null }[]> = {};
    for (const keyword of pack.keywords) history[keyword] = [];
    for (const snap of snapshots) {
      history[snap.keyword]?.push({ date: snap.date.toISOString(), position: snap.position ?? null });
    }

    return NextResponse.json({
      id: String(pack._id),
      domain: pack.domain,
      keywords: pack.keywords,
      locationCode: pack.locationCode,
      purchasedAt: pack.purchasedAt,
      expiresAt: pack.expiresAt,
      active: pack.expiresAt.getTime() > Date.now(),
      history,
    });
  } catch (err) {
    logger.error("Rank tracker pack lookup failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to load pack" }, { status: 500 });
  }
}

/** Stops tracking early (sets expiresAt to now) — owner only. No refund logic for v1. */
export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await dbConnect();
    const result = await RankTrackerPack.updateOne(
      { _id: id, userEmail: session.user.email },
      { $set: { expiresAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Stopping rank tracker pack failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to stop tracking" }, { status: 500 });
  }
}
