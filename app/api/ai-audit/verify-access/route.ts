import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaidToken } from "@/lib/audit/token-verify";
import { logger } from "@/lib/logger";

const bodySchema = z.object({ token: z.string().min(1), url: z.string().min(1).max(2048) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "Missing token or url" }, { status: 400 });
  }

  try {
    const result = await verifyPaidToken(parsed.data.token, parsed.data.url);
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: "Invalid or expired token" }, { status: 401 });
    }
    return NextResponse.json({ valid: true, expiresAt: result.expiresAt });
  } catch (err) {
    logger.error("verify-access failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
