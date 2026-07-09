import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * One paid ($4.99) PageSpeed AI Report per Stripe checkout session — stored
 * so the report can be re-sent/looked up later even though the on-page
 * unlock itself only needs to last the current tab session.
 */
const paidInsightSchema = new Schema({
  stripeSessionId: { type: String, required: true, unique: true },
  domain: { type: String, required: true },
  email: { type: String, default: null },
  html: { type: String, default: null },
  emailStatus: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export type PaidInsightDoc = InferSchemaType<typeof paidInsightSchema>;

export const PaidInsight: Model<PaidInsightDoc> =
  mongoose.models.PaidInsight || mongoose.model<PaidInsightDoc>("PaidInsight", paidInsightSchema);
