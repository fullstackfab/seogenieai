import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

/**
 * Confirms an AI Growth Report purchase against Stripe. Unlike the anonymous
 * insight/ai-audit flows, this feature is account-bound, so a paid session
 * must also match the signed-in user's email — otherwise a leaked
 * ?session_id= URL could unlock another account's report for free.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const domain = checkoutSession.metadata?.domain;
    const metadataEmail = checkoutSession.metadata?.userEmail;
    if (!domain || metadataEmail !== session.user.email) {
      return NextResponse.json({ error: "This session does not belong to your account" }, { status: 403 });
    }

    return NextResponse.json({ success: true, domain });
  } catch (err) {
    logger.error("analytics-verify failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
