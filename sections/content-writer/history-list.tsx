"use client";

import { useState } from "react";
import Link from "next/link";
import { PenLine, Trash2, FileText } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { useToast } from "@/providers/toast-provider";

type HistoryItem = { id: string; contentType: string; topic: string; createdAt: string };

export function HistoryList({ items: initialItems }: { items: HistoryItem[] }) {
  const { showError } = useToast();
  const [items, setItems] = useState(initialItems);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm("Delete this saved content? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/content-writer/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      showError("Couldn't delete this content. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Container>
      <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
        <BackToHome />
        <Link href="/content-writer" className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline">
          <PenLine className="w-4 h-4" aria-hidden="true" />
          Write new content
        </Link>
      </Wrapper>

      <h1 className="text-[#171717] text-[28px] font-bold mb-6">My Saved Content</h1>

      {items.length === 0 ? (
        <Wrapper className="bg-white rounded-2xl border border-black/5 shadow-6xl p-10 text-center mb-16">
          <FileText className="w-10 h-10 mx-auto mb-3 text-black/20" aria-hidden="true" />
          <p className="text-[#475569] mb-4">You haven&apos;t saved any generated content yet.</p>
          <Link
            href="/content-writer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-dark-100 text-white font-medium hover:bg-dark-100/90 transition-colors duration-200"
          >
            <PenLine className="w-4 h-4" aria-hidden="true" />
            Write your first piece
          </Link>
        </Wrapper>
      ) : (
        <Wrapper className="grid gap-3 mb-16">
          {items.map((item) => (
            <Wrapper
              key={item.id}
              className="bg-white rounded-2xl border border-black/5 shadow-6xl p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <Link href={`/content-writer/${item.id}`} className="flex-1 min-w-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 text-xs font-medium mb-1.5">
                  {item.contentType}
                </span>
                <p className="text-[#171717] font-semibold truncate">{item.topic}</p>
                <p className="text-[#94a3b8] text-sm">{new Date(item.createdAt).toLocaleString()}</p>
              </Link>
              <button
                onClick={() => remove(item.id)}
                disabled={deletingId === item.id}
                aria-label={`Delete "${item.topic}"`}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </Wrapper>
          ))}
        </Wrapper>
      )}
    </Container>
  );
}
