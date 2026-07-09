import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const generatedContentSchema = new Schema({
  userEmail: { type: String, required: true, index: true },
  contentType: { type: String, required: true },
  topic: { type: String, required: true },
  tone: { type: String, required: true },
  length: { type: String, required: true },
  keywords: { type: [String], default: [] },
  html: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export type GeneratedContentDoc = InferSchemaType<typeof generatedContentSchema>;

export const GeneratedContent: Model<GeneratedContentDoc> =
  mongoose.models.GeneratedContent ||
  mongoose.model<GeneratedContentDoc>("GeneratedContent", generatedContentSchema);
