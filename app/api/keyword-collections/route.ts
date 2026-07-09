import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { KeywordCollection } from "@/models/KeywordCollection";
import { isSameOrigin } from "@/lib/csrf";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  seedKeywords: z.array(z.string().trim().max(80)).max(25).optional(),
  location: z.string().trim().max(100).optional(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keywords: z.array(z.record(z.string(), z.any())).min(1).max(500),
});

/** Saves a Keyword Planner result set as a named collection against the signed-in user. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Please sign in to save keywords." }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request, "keyword-collections-save"), { limit: 20, windowMs: 60_000 });
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
    await dbConnect();
    const doc = await KeywordCollection.create({
      ...parsed.data,
      userEmail: session.user.email,
    });
    return NextResponse.json({ success: true, id: doc._id.toString() });
  } catch (err) {
    logger.error("Saving keyword collection failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to save keywords" }, { status: 500 });
  }
}
