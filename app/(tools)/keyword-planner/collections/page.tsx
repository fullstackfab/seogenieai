// Rendering: SSR — session-gated; lists this user's saved keyword collections.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { KeywordCollection } from "@/models/KeywordCollection";
import { CollectionHistoryList } from "@/sections/keyword-planner/collection-history-list";

export const metadata: Metadata = {
  title: "My Saved Keyword Collections",
  robots: { index: false, follow: false },
};

export default async function KeywordCollectionsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/keyword-planner");

  await dbConnect();
  const docs = await KeywordCollection.find({ userEmail: session.user.email })
    .sort({ createdAt: -1 })
    .lean();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    keywordCount: doc.keywords?.length ?? 0,
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  return <CollectionHistoryList items={items} />;
}
