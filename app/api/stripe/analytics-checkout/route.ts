import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { PaidAnalyticsReport } from "@/models/PaidAnalyticsReport";
import { domainSchema } from "@/lib/validation/common";
import { isSameOrigin } from "@/lib/csrf";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const bodySchema = z.object({ domain: domainSchema });

/** Creates the $7.99 AI Growth Report checkout session (one-time unlock per user+domain). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Please sign in to unlock this report." }, { status: 401 });
  }

  const limit = rateLimit(clientKey(request, "analytics-checkout"), { limit: 5, windowMs: 60_000 });
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
  const { domain } = parsed.data;
  const userEmail = session.user.email;

  try {
    await dbConnect();
    const existing = await PaidAnalyticsReport.findOne({ userEmail, domain }).lean();
    if (existing?.reportHtml) {
      return NextResponse.json({ alreadyUnlocked: true });
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 799,
            product_data: {
              name: "AI Growth Report",
              description: `AI-written traffic, engagement, conversion and SEO fix plan for ${domain}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { domain, userEmail },
      success_url: `${env.APP_URL}/domain-analysis?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/domain-analysis`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    logger.error("Analytics checkout failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
