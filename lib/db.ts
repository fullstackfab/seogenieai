import "server-only";
import mongoose from "mongoose";
import { env } from "@/lib/env";

/**
 * Cached connection for serverless: module state survives warm invocations,
 * so we reuse one connection instead of opening a new one per request.
 */
declare global {
  var _mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = globalThis._mongoose ?? (globalThis._mongoose = { conn: null, promise: null });

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URI, { bufferCommands: false });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
