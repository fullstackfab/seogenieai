import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * One paid ($9.99) AI-readiness report per Stripe checkout session.
 * accessToken/expiresAt unlock the on-page paid report; the legacy webhook
 * never set them (so the online report could never unlock) — the new webhook
 * always does.
 */
const paidAuditSchema = new Schema({
  stripeSessionId: { type: String, required: true, unique: true },
  auditUrl: { type: String, required: true },
  email: { type: String, default: null },
  status: {
    type: String,
    enum: ["processing", "generating_pdf", "sending_email", "sent", "failed"],
    default: "processing",
  },
  errorMessage: { type: String, default: null },
  accessToken: { type: String, index: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  // Computed once (DataForSEO + Claude fix plan are the expensive part of a
  // report) and reused for every subsequent open of this report link — a new
  // report only happens via a new payment, never a re-fetch.
  reportData: { type: Schema.Types.Mixed, default: null },
});

export type PaidAuditDoc = InferSchemaType<typeof paidAuditSchema>;

export const PaidAudit: Model<PaidAuditDoc> =
  mongoose.models.PaidAudit || mongoose.model<PaidAuditDoc>("PaidAudit", paidAuditSchema);
