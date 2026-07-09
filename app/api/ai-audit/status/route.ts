import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { PaidAudit } from "@/models/PaidAudit";
import { isTokenWellFormed } from "@/lib/audit-token";
import { logger } from "@/lib/logger";

/** Report-page poll: PDF generation / email delivery status for a paid access token. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!isTokenWellFormed(token)) {
    return NextResponse.json({ error: "Missing or invalid token" }, { status: 400 });
  }

  try {
    await dbConnect();
    const paidAudit = await PaidAudit.findOne({
      accessToken: token,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!paidAudit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ status: paidAudit.status, email: paidAudit.email });
  } catch (err) {
    logger.error("ai-audit status check failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
