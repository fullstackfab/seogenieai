import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic, CLAUDE_MODEL } from "@/lib/anthropic/client";
import { buildChatPrompt } from "@/lib/anthropic/prompts";
import { rateLimit, clientKey, clientIp } from "@/lib/rate-limit";
import { checkDailyLimit } from "@/lib/daily-limit";
import { getStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

const CONTENT_WRITER_DAILY_LIMIT = 2;

export const maxDuration = 120;

const bodySchema = z.object({
  userPrompt: z.string().trim().min(1).max(60_000),
  nonHtmlResponse: z.boolean().optional(),
  keyWordsContent: z.boolean().optional(),
  pageSpeedInsights: z.boolean().optional(),
  stripeSessionId: z.string().max(255).optional(),
  contentWriter: z.boolean().optional(),
  contentType: z.string().max(60).optional(),
  tone: z.string().max(40).optional(),
  length: z.enum(["short", "medium", "long"]).optional(),
  keywords: z.array(z.string().trim().max(80)).max(15).optional(),
  country: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

/**
 * Streams a Claude Haiku 4.5 response as plain text chunks — the contract the
 * legacy client's utils/chat.js reader expects. (The Express version had this
 * fully commented out; this route revives it.)
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "chat"), { limit: 10, windowMs: 60_000 });
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

  // Content Writer is free but still spends real Claude tokens per
  // generate/regenerate click — cap it at 2 per IP per UTC day.
  if (parsed.data.contentWriter) {
    const daily = await checkDailyLimit("content-writer", clientIp(request), CONTENT_WRITER_DAILY_LIMIT);
    if (!daily.ok) {
      return NextResponse.json(
        { error: "You've used today's 2 free generations for Content Writer. Please try again tomorrow." },
        { status: 429 }
      );
    }
  }

  // The PageSpeed AI Report is a paid feature — require proof of a completed
  // Stripe Checkout session before spending tokens on it.
  if (parsed.data.pageSpeedInsights) {
    if (!parsed.data.stripeSessionId) {
      return NextResponse.json({ error: "Payment required" }, { status: 402 });
    }
    try {
      const session = await getStripe().checkout.sessions.retrieve(parsed.data.stripeSessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
      }
    } catch (err) {
      logger.error("Chat payment verification failed", {
        message: err instanceof Error ? err.message : "unknown",
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 402 });
    }
  }

  try {
    // The PageSpeed AI Report's fix-plan-per-issue format runs much longer
    // than the other chat flags — 4096 tokens was truncating it mid-report.
    const maxTokens = parsed.data.pageSpeedInsights ? 8192 : 4096;
    const stream = getAnthropic().messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: buildChatPrompt(parsed.data) }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          logger.error("Chat stream interrupted", {
            message: err instanceof Error ? err.message : "unknown",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (err) {
    logger.error("Chat request failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }
}
