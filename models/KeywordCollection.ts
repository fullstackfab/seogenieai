import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const keywordCollectionSchema = new Schema({
  userEmail: { type: String, required: true, index: true },
  name: { type: String, required: true },
  seedKeywords: { type: [String], default: [] },
  location: { type: String, default: null },
  // Keyword result objects vary by upstream provider fields — stored as-is.
  keywords: { type: [Schema.Types.Mixed], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export type KeywordCollectionDoc = InferSchemaType<typeof keywordCollectionSchema>;

export const KeywordCollection: Model<KeywordCollectionDoc> =
  mongoose.models.KeywordCollection ||
  mongoose.model<KeywordCollectionDoc>("KeywordCollection", keywordCollectionSchema);
