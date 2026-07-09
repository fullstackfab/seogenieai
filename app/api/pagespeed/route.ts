import { NextResponse } from "next/server";
import { z } from "zod";
import { runPageSpeedInsights } from "@/lib/pagespeed";
import { urlSchema } from "@/lib/validation/common";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const maxDuration = 120;

const bodySchema = z.object({
  url: urlSchema,
  type: z.enum(["mobile", "desktop"]),
});

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "pagespeed"), { limit: 10, windowMs: 60_000 });
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
    const result = await runPageSpeedInsights(parsed.data.url, parsed.data.type);
    return NextResponse.json(result);
  } catch (err) {
    logger.error("PageSpeed request failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "PageSpeed analysis failed" }, { status: 502 });
  }
}
