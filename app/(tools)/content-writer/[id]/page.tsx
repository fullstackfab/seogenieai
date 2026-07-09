// Rendering: SSR — session-gated; loads one saved generation directly from the
// database so it has a permanent, shareable-with-yourself URL (unlike the
// ephemeral in-memory result on /content-writer).
import type { Metadata } from "next";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { GeneratedContent } from "@/models/GeneratedContent";
import { SavedContentView } from "@/sections/content-writer/saved-content-view";

export const metadata: Metadata = {
  title: "Saved Content",
  robots: { index: false, follow: false },
};

export default async function SavedContentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/content-writer");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const doc = await GeneratedContent.findOne({ _id: id, userEmail: session.user.email }).lean();
  if (!doc) notFound();

  return (
    <SavedContentView
      id={id}
      html={doc.html}
      contentType={doc.contentType}
      topic={doc.topic}
      tone={doc.tone}
      createdAt={doc.createdAt?.toISOString() ?? new Date().toISOString()}
    />
  );
}
