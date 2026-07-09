import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { RankTrackerPack } from "@/models/RankTrackerPack";
import { logger } from "@/lib/logger";

/** Lists the signed-in user's Rank Tracker packs, newest first. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await dbConnect();
    const packs = await RankTrackerPack.find({ userEmail: session.user.email })
      .sort({ purchasedAt: -1 })
      .lean();

    return NextResponse.json({
      packs: packs.map((pack) => ({
        id: String(pack._id),
        domain: pack.domain,
        keywordCount: pack.keywords.length,
        purchasedAt: pack.purchasedAt,
        expiresAt: pack.expiresAt,
        active: pack.expiresAt.getTime() > Date.now(),
      })),
    });
  } catch (err) {
    logger.error("Listing rank tracker packs failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to list packs" }, { status: 500 });
  }
}
