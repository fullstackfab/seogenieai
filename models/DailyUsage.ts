import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Per-IP daily usage counter for free, cost-bearing features (Content
 * Writer, Keyword Planner). Keyed by `{feature}:{ip}` + the UTC calendar
 * day so it's a single atomic $inc per request — unlike lib/rate-limit.ts's
 * in-memory limiter, this persists across serverless instances/cold starts,
 * which a 24h window needs to actually hold. `createdAt` has a 2-day TTL
 * index since only "today" is ever queried.
 */
const dailyUsageSchema = new Schema({
  key: { type: String, required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 2 },
});

dailyUsageSchema.index({ key: 1, date: 1 }, { unique: true });

export type DailyUsageDoc = InferSchemaType<typeof dailyUsageSchema>;

export const DailyUsage: Model<DailyUsageDoc> =
  mongoose.models.DailyUsage || mongoose.model<DailyUsageDoc>("DailyUsage", dailyUsageSchema);
