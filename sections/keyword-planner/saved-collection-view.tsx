"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, KeyRound } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { KeywordAnalyticsTable } from "@/components/keyword-analytics-table";
import { useToast } from "@/providers/toast-provider";

export function SavedCollectionView({
  id,
  name,
  createdAt,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keywords,
}: {
  id: string;
  name: string;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keywords: any[];
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function deleteCollection() {
    if (!window.confirm("Delete this saved collection? This can't be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/keyword-collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showSuccess("Deleted.");
      router.push("/keyword-planner/collections");
    } catch {
      showError("Couldn't delete this collection. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <Container>
      <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
        <BackToHome heading="My saved collections" link="/keyword-planner/collections" />
        <Link
          href="/keyword-planner"
          className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
        >
          <KeyRound className="w-4 h-4" aria-hidden="true" />
          New keyword search
        </Link>
      </Wrapper>

      <Wrapper className="flex items-center gap-2 flex-wrap mb-4 text-sm text-[#64748b]">
        <span>Saved {new Date(createdAt).toLocaleString()}</span>
      </Wrapper>
      <h1 className="text-[#171717] text-2xl font-bold mb-6 max-w-160">{name}</h1>

      <Wrapper className="bg-white p-10 mb-6 overflow-auto rounded-2xl shadow-6xl">
        <KeywordAnalyticsTable keywords={keywords} />
      </Wrapper>

      <Wrapper className="flex gap-3 flex-wrap mb-16">
        <button
          onClick={deleteCollection}
          disabled={deleting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </Wrapper>
    </Container>
  );
}
