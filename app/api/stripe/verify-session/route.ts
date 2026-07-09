import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { PaidAudit } from "@/models/PaidAudit";
import { logger } from "@/lib/logger";

/** Success-page poll: returns the access token once the webhook has landed. */
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

    const auditUrl = session.metadata?.audit_url;
    const customerEmail =
      session.metadata?.customer_email ?? session.customer_details?.email ?? null;
    if (!auditUrl) {
      return NextResponse.json({ error: "Missing audit URL in session" }, { status: 400 });
    }

    await dbConnect();
    const paidAudit = await PaidAudit.findOne({ stripeSessionId: sessionId }).lean();
    if (!paidAudit) {
      // Webhook hasn't fired yet — the client retries.
      return NextResponse.json({ pending: true, auditUrl, customerEmail });
    }

    return NextResponse.json({
      success: true,
      accessToken: paidAudit.accessToken,
      auditUrl: paidAudit.auditUrl,
      customerEmail: paidAudit.email,
      expiresAt: paidAudit.expiresAt,
      status: paidAudit.status,
    });
  } catch (err) {
    logger.error("verify-session failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
