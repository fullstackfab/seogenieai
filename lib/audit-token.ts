import "server-only";
import crypto from "node:crypto";
import { env } from "@/lib/env";

/** HMAC-signed access token tied to a Stripe session + audited URL. */
export function generateAccessToken(stripeSessionId: string, auditUrl: string): string {
  const payload = `${stripeSessionId}:${auditUrl}:${Date.now()}`;
  const hash = crypto.createHmac("sha256", env.AUDIT_TOKEN_SECRET).update(payload).digest("hex");
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${hash}`;
}

/** Cheap structural check; the DB lookup is the real auth check. */
export function isTokenWellFormed(token: unknown): token is string {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 2 && parts[0].length > 0 && parts[1].length === 64;
}
