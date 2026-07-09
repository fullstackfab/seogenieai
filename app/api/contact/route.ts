import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Contact } from "@/models/Contact";
import { createTransport } from "@/lib/email";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phoneNumber: z.coerce.number().optional(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().max(5000).optional().default(""),
  url: z.string().trim().min(1).max(2048),
});

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Replaces the legacy Express POST /api/send-email. The legacy handler put the
 * raw user message straight into the email HTML — here every field is escaped.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "contact"), { limit: 5, windowMs: 60_000 });
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
  const { name, email, phoneNumber, subject, message, url } = parsed.data;

  try {
    await dbConnect();
    await Contact.create({ name, email, phoneNumber, subject, message, url });

    await createTransport().sendMail({
      from: `SEOGenieAI Contact <${env.SMTP_USER}>`,
      replyTo: email,
      to: env.CONTACT_EMAIL_TO,
      subject: esc(subject),
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        ${phoneNumber ? `<p><strong>Phone:</strong> ${phoneNumber}</p>` : ""}
        <p><strong>Website:</strong> ${esc(url)}</p>
        <p><strong>Message:</strong></p>
        <p>${esc(message).replace(/\n/g, "<br/>")}</p>`,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    logger.error("Contact submission failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
