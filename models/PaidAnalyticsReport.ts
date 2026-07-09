import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * One paid ($7.99) AI Growth Report per signed-in user per domain — computed
 * once from that user's GA4/Search Console snapshot and cached forever.
 * Re-opening the dashboard (or paying again for the same domain) must never
 * re-trigger Claude: see getOrCreateAnalyticsReport.
 */
const paidAnalyticsReportSchema = new Schema({
  userEmail: { type: String, required: true, index: true },
  domain: { type: String, required: true },
  stripeSessionId: { type: String, required: true },
  reportHtml: { type: String, default: null },
  emailStatus: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

paidAnalyticsReportSchema.index({ userEmail: 1, domain: 1 }, { unique: true });

export type PaidAnalyticsReportDoc = InferSchemaType<typeof paidAnalyticsReportSchema>;

export const PaidAnalyticsReport: Model<PaidAnalyticsReportDoc> =
  mongoose.models.PaidAnalyticsReport ||
  mongoose.model<PaidAnalyticsReportDoc>("PaidAnalyticsReport", paidAnalyticsReportSchema);
