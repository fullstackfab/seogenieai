import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { domainSchema } from "@/lib/validation/common";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  domain: domainSchema,
  email: z.string().trim().email().optional(),
});

/** Creates the $4.99 PageSpeed AI Report checkout session (single-scan unlock, no email/PDF). */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "insight-checkout"), { limit: 5, windowMs: 60_000 });
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
  const { domain, email } = parsed.data;

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      ...(email ? { customer_email: email } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 499,
            product_data: {
              name: "PageSpeed AI Report",
              description: `AI-written performance, SEO, accessibility and best-practices breakdown for ${domain}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { insight_domain: domain },
      success_url: `${env.APP_URL}/insight?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/insight`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error("Insight checkout failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
