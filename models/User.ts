import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  googleTokens: {
    access_token: { type: String },
    refresh_token: { type: String },
    scope: { type: String },
    token_type: { type: String },
    expiry_date: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
});

export type UserDoc = InferSchemaType<typeof userSchema>;

// Same collection name ("users") as the legacy Express server.
export const User: Model<UserDoc> =
  mongoose.models.users || mongoose.model<UserDoc>("users", userSchema);
