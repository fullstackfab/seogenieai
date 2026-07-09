import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers on every response (fabcode-security Rule 5).
 * Next.js 16 renamed middleware.ts to proxy.ts — same behavior.
 *
 * CSP allowances:
 * - gstatic.com          → react-google-charts loader
 * - googletagmanager.com → GA4 script
 * - google-analytics.com → GA4 beacons (connect-src)
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://www.gstatic.com",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.gstatic.com",
  "frame-ancestors 'none'",
].join("; ");

export function proxy(_req: NextRequest) {
  const res = NextResponse.next();

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.headers.set("Content-Security-Policy", CSP);

  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
