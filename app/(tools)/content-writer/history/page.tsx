// Rendering: SSR — session-gated; lists this user's saved content-writer generations.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { GeneratedContent } from "@/models/GeneratedContent";
import { HistoryList } from "@/sections/content-writer/history-list";

export const metadata: Metadata = {
  title: "My Saved Content",
  robots: { index: false, follow: false },
};

export default async function ContentWriterHistoryPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/content-writer");

  await dbConnect();
  const docs = await GeneratedContent.find({ userEmail: session.user.email })
    .sort({ createdAt: -1 })
    .lean();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    contentType: doc.contentType,
    topic: doc.topic,
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  return <HistoryList items={items} />;
}
