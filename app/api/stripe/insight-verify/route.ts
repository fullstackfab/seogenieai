import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

/**
 * Confirms a PageSpeed AI Report purchase directly against Stripe — no DB
 * record needed since the unlock only has to last for this scan session.
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const domain = session.metadata?.insight_domain;
    if (!domain) {
      return NextResponse.json({ error: "Missing domain in session" }, { status: 400 });
    }

    const email = session.customer_details?.email ?? session.customer_email ?? null;
    return NextResponse.json({ success: true, domain, email });
  } catch (err) {
    logger.error("insight-verify failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
