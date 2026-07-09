import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { renderPdf } from "@/lib/pdf/render";
import { buildInsightReportHtml } from "@/lib/pdf/build-insight-report-html";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const bodySchema = z.object({
  html: z.string().trim().min(1).max(200_000),
  domain: z.string().trim().max(253),
  stripeSessionId: z.string().trim().min(1).max(255),
});

/** Renders the paid PageSpeed AI report as a downloadable PDF — gated on the same Stripe session used to unlock it. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "insight-pdf"), { limit: 5, windowMs: 60_000 });
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
  const { html, domain, stripeSessionId } = parsed.data;

  try {
    const session = await getStripe().checkout.sessions.retrieve(stripeSessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }
  } catch (err) {
    logger.error("Insight PDF payment verification failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 402 });
  }

  try {
    const pdf = await renderPdf(buildInsightReportHtml({ domain, html }));
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pagespeed-ai-report-${domain.replace(/[^a-z0-9.-]/gi, "-") || "report"}.pdf"`,
      },
    });
  } catch (err) {
    logger.error("Insight PDF generation failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
