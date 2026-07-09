import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { RankTrackerPack } from "@/models/RankTrackerPack";
import { RankSnapshot } from "@/models/RankSnapshot";
import { checkKeywordRank, startOfUtcDay } from "@/lib/rank-tracker/check-rank";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const PACK_DAYS = 30;

/**
 * Confirms a Rank Tracker purchase, creates the pack (idempotent on
 * stripeSessionId — safe against duplicate calls/retries), and runs the
 * first day's checks immediately so the user sees rankings right away
 * instead of waiting for tomorrow's cron.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userEmail = session.user.email;

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }
    if (checkoutSession.metadata?.userEmail !== userEmail) {
      return NextResponse.json({ error: "This session does not belong to your account" }, { status: 403 });
    }

    const domain = checkoutSession.metadata?.domain;
    const keywords: string[] = JSON.parse(checkoutSession.metadata?.keywords ?? "[]");
    const locationCode = Number(checkoutSession.metadata?.locationCode ?? 2840);
    if (!domain || keywords.length === 0) {
      return NextResponse.json({ error: "Missing pack details in session" }, { status: 400 });
    }

    await dbConnect();

    let pack = await RankTrackerPack.findOne({ stripeSessionId: sessionId });
    if (!pack) {
      const purchasedAt = new Date();
      pack = await RankTrackerPack.create({
        userEmail,
        domain,
        keywords,
        locationCode,
        languageCode: "en",
        stripeSessionId: sessionId,
        purchasedAt,
        expiresAt: new Date(purchasedAt.getTime() + PACK_DAYS * 24 * 60 * 60 * 1000),
      });
    }

    const today = startOfUtcDay(new Date());
    await Promise.all(
      pack.keywords.map(async (keyword) => {
        const existing = await RankSnapshot.findOne({ packId: pack._id, keyword, date: today }).lean();
        if (existing) return;
        try {
          const { position, url } = await checkKeywordRank({
            keyword,
            domain: pack.domain,
            locationCode: pack.locationCode,
            languageCode: pack.languageCode,
          });
          await RankSnapshot.updateOne(
            { packId: pack._id, keyword, date: today },
            { $set: { position, url, checkedAt: new Date() } },
            { upsert: true }
          );
        } catch (checkErr) {
          logger.error("Rank Tracker initial check failed", {
            keyword,
            message: checkErr instanceof Error ? checkErr.message : "unknown",
          });
        }
      })
    );

    return NextResponse.json({ success: true, packId: String(pack._id) });
  } catch (err) {
    logger.error("Rank Tracker verify failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
