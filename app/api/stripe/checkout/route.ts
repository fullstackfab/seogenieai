import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { urlSchema } from "@/lib/validation/common";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  url: urlSchema,
  email: z.string().trim().email("A valid email address is required to receive your report."),
});

/** Creates the $9.99 AI Readiness Report checkout session. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "checkout"), { limit: 5, windowMs: 60_000 });
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
  const { url, email } = parsed.data;

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 999,
            product_data: {
              name: "AI Readiness Report",
              description: `Full AI readiness audit for ${url} — delivered to ${email}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { audit_url: url, customer_email: email },
      success_url: `${env.APP_URL}/ai-audit/success?email=${encodeURIComponent(email)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/ai-audit/report?url=${encodeURIComponent(url)}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error("Stripe checkout failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
