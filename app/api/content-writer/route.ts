import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { GeneratedContent } from "@/models/GeneratedContent";
import { isSameOrigin } from "@/lib/csrf";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  contentType: z.string().trim().min(1).max(60),
  topic: z.string().trim().min(1).max(300),
  tone: z.string().trim().min(1).max(40),
  length: z.enum(["short", "medium", "long"]),
  keywords: z.array(z.string().trim().max(80)).max(15).optional(),
  html: z.string().trim().min(1).max(60_000),
});

/** Saves a generated content-writer result against the signed-in user. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Please sign in to save content." }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request, "content-writer-save"), { limit: 20, windowMs: 60_000 });
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
    const doc = await GeneratedContent.create({
      ...parsed.data,
      html: sanitizeHtml(parsed.data.html),
      userEmail: session.user.email,
    });
    return NextResponse.json({ success: true, id: doc._id.toString() });
  } catch (err) {
    logger.error("Saving generated content failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
