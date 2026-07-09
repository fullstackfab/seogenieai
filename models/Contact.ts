import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: Number, required: false },
  subject: { type: String, required: true },
  message: { type: String, required: false },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export type ContactDoc = InferSchemaType<typeof contactSchema>;

// Same collection name ("contactus") as the legacy Express server.
export const Contact: Model<ContactDoc> =
  mongoose.models.contactus || mongoose.model<ContactDoc>("contactus", contactSchema);
