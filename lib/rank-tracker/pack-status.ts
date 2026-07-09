/**
 * Plain helpers wrapping Date.now()/new Date() — kept outside any component
 * body (and outside "server-only" lib/rank-tracker/check-rank.ts, since these
 * are used from client components too) so the React Compiler's purity lint,
 * which flags Date.now()/new Date() calls written directly inside a
 * component/render path, doesn't fire at every call site.
 */
export function isPackActive(expiresAt: Date | string): boolean {
  return new Date(expiresAt).getTime() > Date.now();
}

export function daysRemaining(expiresAt: Date | string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}
