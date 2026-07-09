import "server-only";

/**
 * Same-origin check for state-changing routes authenticated by session
 * cookies (fabcode-security Rule 3). Browsers always attach Origin to
 * cross-origin POSTs, so rejecting mismatched origins blocks CSRF without
 * a token round-trip. Bearer/HMAC-token routes don't need this.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser client (no cookies auto-attached)
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
