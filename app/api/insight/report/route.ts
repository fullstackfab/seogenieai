import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic, CLAUDE_MODEL } from "@/lib/anthropic/client";
import { buildChatPrompt } from "@/lib/anthropic/prompts";
import { getStripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { PaidInsight } from "@/models/PaidInsight";
import { domainSchema } from "@/lib/validation/common";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { logger } from "@/lib/logger";

export const maxDuration = 120;

const MAX_PAYLOAD_LENGTH = 200_000;

const bodySchema = z.object({
  domain: domainSchema,
  stripeSessionId: z.string().trim().min(1).max(255),
  analyticalPayload: z.unknown(),
});

/** Cached lookup — has this Stripe session's PageSpeed AI report already been generated? */
export async function GET(request: Request) {
  const stripeSessionId = new URL(request.url).searchParams.get("stripeSessionId")?.trim();
  if (!stripeSessionId) {
    return NextResponse.json({ error: "Missing stripeSessionId" }, { status: 400 });
  }

  try {
    await dbConnect();
    const existing = await PaidInsight.findOne({ stripeSessionId }).lean();
    return NextResponse.json({ unlocked: !!existing?.html, html: existing?.html ?? null });
  } catch (err) {
    logger.error("Insight report lookup failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to look up report" }, { status: 500 });
  }
}

/**
 * Generates (once) and caches the paid PageSpeed AI Report for a Stripe
 * session. If already generated for this session it's returned immediately —
 * no Claude call, no re-charge. This is what "View AI Report" should always
 * hit after the first generation, instead of re-streaming from /api/chat.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "insight-report"), { limit: 5, windowMs: 60_000 });
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
  const { domain, stripeSessionId, analyticalPayload } = parsed.data;

  const payloadJson = JSON.stringify(analyticalPayload ?? {});
  if (payloadJson.length > MAX_PAYLOAD_LENGTH) {
    return NextResponse.json({ error: "Report payload too large" }, { status: 400 });
  }

  try {
    await dbConnect();

    // Already generated for this paid session — never re-charge or re-generate.
    const existing = await PaidInsight.findOne({ stripeSessionId }).lean();
    if (existing?.html) {
      return NextResponse.json({ success: true, html: existing.html, cached: true });
    }

    const session = await getStripe().checkout.sessions.retrieve(stripeSessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }
    if (session.metadata?.insight_domain !== domain) {
      return NextResponse.json({ error: "This session does not match the requested domain" }, { status: 403 });
    }

    const response = await getAnthropic().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      messages: [
        { role: "user", content: buildChatPrompt({ userPrompt: payloadJson, pageSpeedInsights: true }) },
      ],
    });

    if (response.stop_reason === "max_tokens") {
      logger.warn("Insight AI report hit max_tokens", { domain });
    }

    const rawText = response.content
      .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
      .map((block) => block.text)
      .join("");
    const html = sanitizeHtml(rawText);

    await PaidInsight.updateOne(
      { stripeSessionId },
      { $set: { domain, html } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, html, cached: false });
  } catch (err) {
    logger.error("Insight report generation failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
