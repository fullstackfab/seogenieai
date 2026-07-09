import { NextResponse } from "next/server";
import { z } from "zod";
import { runFullAudit } from "@/lib/audit/engine";
import { urlSchema } from "@/lib/validation/common";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const bodySchema = z.object({ url: urlSchema });

/** Free 19-check AI-readiness audit. Returns { success, url, domain, score, audit }. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "audit"), { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await runFullAudit(parsed.data.url));
  } catch (err) {
    logger.error("Audit failed", { message: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "Audit failed" }, { status: 502 });
  }
}
