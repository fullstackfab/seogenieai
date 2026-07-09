import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * One rank check for one keyword on one day — the history behind the trend
 * chart. Unique on {packId, keyword, date} so the daily cron's upsert is
 * idempotent: rerunning it (or backfilling) can never duplicate a day's row.
 */
const rankSnapshotSchema = new Schema({
  packId: { type: Schema.Types.ObjectId, ref: "RankTrackerPack", required: true, index: true },
  keyword: { type: String, required: true },
  date: { type: Date, required: true },
  position: { type: Number, default: null },
  url: { type: String, default: null },
  checkedAt: { type: Date, default: Date.now },
});

rankSnapshotSchema.index({ packId: 1, keyword: 1, date: 1 }, { unique: true });

export type RankSnapshotDoc = InferSchemaType<typeof rankSnapshotSchema>;

export const RankSnapshot: Model<RankSnapshotDoc> =
  mongoose.models.RankSnapshot || mongoose.model<RankSnapshotDoc>("RankSnapshot", rankSnapshotSchema);
