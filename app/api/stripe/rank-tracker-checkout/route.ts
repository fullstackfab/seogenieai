import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { RankTrackerPack } from "@/models/RankTrackerPack";
import { domainSchema } from "@/lib/validation/common";
import { countryIsoToLocationCode } from "@/lib/location-map";
import { isSameOrigin } from "@/lib/csrf";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const MAX_KEYWORDS = 10;

const bodySchema = z.object({
  domain: domainSchema,
  keywords: z.array(z.string().trim().min(1).max(200)).min(1).max(MAX_KEYWORDS),
  country: z.string().trim().length(2).optional(),
});

/** Creates the $9.99 Rank Tracker checkout session — a one-time pack (10 keywords / 30 days) per user+domain. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Please sign in to start tracking rankings." }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request, "rank-tracker-checkout"), { limit: 5, windowMs: 60_000 });
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
  const { domain, keywords, country } = parsed.data;
  const userEmail = session.user.email;
  const locationCode = (country && countryIsoToLocationCode(country)) || 2840;

  try {
    await dbConnect();
    const existing = await RankTrackerPack.findOne({
      userEmail,
      domain,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (existing) {
      return NextResponse.json({ alreadyActive: true, packId: String(existing._id) });
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 999,
            product_data: {
              name: "Rank Tracker — 30-day pack",
              description: `Daily Google rank tracking for ${keywords.length} keyword(s) on ${domain}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        domain,
        userEmail,
        keywords: JSON.stringify(keywords),
        locationCode: String(locationCode),
      },
      success_url: `${env.APP_URL}/rank-tracker/new?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/rank-tracker`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    logger.error("Rank Tracker checkout failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
