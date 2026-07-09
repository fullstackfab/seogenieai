// Rendering: SSR — session-gated; loads one saved keyword collection directly
// from the database so it has a permanent, shareable-with-yourself URL
// (unlike the ephemeral in-memory result on /keyword-planner).
import type { Metadata } from "next";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { KeywordCollection } from "@/models/KeywordCollection";
import { SavedCollectionView } from "@/sections/keyword-planner/saved-collection-view";

export const metadata: Metadata = {
  title: "Saved Keyword Collection",
  robots: { index: false, follow: false },
};

export default async function SavedKeywordCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/keyword-planner");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const doc = await KeywordCollection.findOne({ _id: id, userEmail: session.user.email }).lean();
  if (!doc) notFound();

  return (
    <SavedCollectionView
      id={id}
      name={doc.name}
      keywords={doc.keywords ?? []}
      createdAt={doc.createdAt?.toISOString() ?? new Date().toISOString()}
    />
  );
}
