import "server-only";
import { z } from "zod";

/**
 * Server-side environment schema, validated once at first import.
 * Client-exposed vars (NEXT_PUBLIC_*) are read directly via process.env
 * so Next.js can inline them at build time.
 */
const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_GOOGLE_ID: z.string().min(1, "AUTH_GOOGLE_ID is required"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "AUTH_GOOGLE_SECRET is required"),
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  DATAFORSEO_LOGIN: z.string().min(1, "DATAFORSEO_LOGIN is required"),
  DATAFORSEO_PASSWORD: z.string().min(1, "DATAFORSEO_PASSWORD is required"),
  PAGE_SPEED_INSIGHTS_KEY: z.string().min(1, "PAGE_SPEED_INSIGHTS_KEY is required"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  CONTACT_EMAIL_TO: z.string().email(),
  AUDIT_TOKEN_SECRET: z.string().min(16, "AUDIT_TOKEN_SECRET must be at least 16 chars"),
  APP_URL: z.string().url(),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 chars"),
});

export const env = serverEnvSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN,
  DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD,
  PAGE_SPEED_INSIGHTS_KEY: process.env.PAGE_SPEED_INSIGHTS_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO,
  AUDIT_TOKEN_SECRET: process.env.AUDIT_TOKEN_SECRET,
  APP_URL: process.env.APP_URL,
  CRON_SECRET: process.env.CRON_SECRET,
});
