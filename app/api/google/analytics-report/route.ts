import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getGoogleClientForUser } from "@/lib/google/oauth-client";
import { getGoogleAnalyticsReport } from "@/lib/google/analytics";
import { domainSchema } from "@/lib/validation/common";
import { isSameOrigin } from "@/lib/csrf";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const maxDuration = 120;

const bodySchema = z.object({
  option: z.object({
    domain: domainSchema,
    oneDayAgo: z.boolean().optional(),
    oneWeekAgo: z.boolean().optional(),
    oneMonthAgo: z.boolean().optional(),
    compareDates: z.boolean().optional(),
    value: z.object({ startDate: z.string(), endDate: z.string() }).optional(),
  }),
});

/**
 * Identity comes from the Auth.js session — never from the request body.
 * (The legacy Express route accepted { email } and returned that user's
 * Analytics data to anyone: a straight IDOR, now closed.)
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request, "analytics"), { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 }
    );
  }

  const client = await getGoogleClientForUser(session.user.email);
  if (!client) {
    return NextResponse.json(
      { success: false, message: "Google account not connected. Please sign in again." },
      { status: 403 }
    );
  }

  try {
    const report = await getGoogleAnalyticsReport(client, parsed.data.option);
    return NextResponse.json({ success: true, report });
  } catch (err) {
    logger.error("Analytics report failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(
      { success: false, message: "Failed to fetch the analytics report" },
      { status: 502 }
    );
  }
}
