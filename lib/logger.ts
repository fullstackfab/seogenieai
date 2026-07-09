/**
 * Structured logger (fabcode-security Rule 2): never log user objects,
 * tokens, emails, or request bodies. info() is silenced in production.
 */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[INFO] ${message}`, meta ?? "");
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, meta ?? "");
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, meta ?? "");
  },
};
