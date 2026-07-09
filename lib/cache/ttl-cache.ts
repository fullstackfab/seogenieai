import "server-only";

type Entry<T> = { value: T; expiresAt: number };

/**
 * Generic in-memory TTL cache with in-flight request coalescing.
 *
 * Per-instance only (same tradeoff as lib/rate-limit.ts) — resets on cold
 * start and isn't shared across serverless instances. That's fine for
 * damping cost on a single warm instance; swap the Map for a shared store
 * (e.g. Upstash/Redis) behind the same `wrap()` interface if cross-instance
 * sharing is ever needed.
 */
export class TtlCache<T> {
  private store = new Map<string, Entry<T>>();
  private inFlight = new Map<string, Promise<T>>();

  constructor(
    private ttlMs: number,
    private maxEntries = 500
  ) {}

  private prune(now: number) {
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
    }
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T) {
    const now = Date.now();
    if (this.store.size > this.maxEntries) this.prune(now);
    this.store.set(key, { value, expiresAt: now + this.ttlMs });
  }

  /**
   * Serves `key` from cache when fresh; otherwise runs `fetcher` once and
   * caches the result. Concurrent calls for the same key while a fetch is
   * already in flight share that one request instead of firing another.
   */
  async wrap(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const pending = this.inFlight.get(key);
    if (pending) return pending;

    const promise = fetcher()
      .then((value) => {
        this.set(key, value);
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }
}
