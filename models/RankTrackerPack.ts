import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * One paid ($9.99) 30-day / 10-keyword rank-tracking pack per user+domain.
 * One-time purchase, not a subscription — renewal is just buying another
 * pack. `expiresAt` is the single source of truth for both the dashboard
 * ("active" badge) and the cron (which packs still need daily checks).
 */
const rankTrackerPackSchema = new Schema({
  userEmail: { type: String, required: true, index: true },
  domain: { type: String, required: true },
  keywords: { type: [String], required: true },
  locationCode: { type: Number, default: 2840 },
  languageCode: { type: String, default: "en" },
  stripeSessionId: { type: String, required: true, unique: true },
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
});

export type RankTrackerPackDoc = InferSchemaType<typeof rankTrackerPackSchema>;

export const RankTrackerPack: Model<RankTrackerPackDoc> =
  mongoose.models.RankTrackerPack ||
  mongoose.model<RankTrackerPackDoc>("RankTrackerPack", rankTrackerPackSchema);
