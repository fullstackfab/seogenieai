"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, FileBarChart, LineChart } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { useToast } from "@/providers/toast-provider";

type ReportItem = { id: string; domain: string; createdAt: string };

export function ReportsList({ items: initialItems }: { items: ReportItem[] }) {
  const { showError } = useToast();
  const [items, setItems] = useState(initialItems);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm("Delete this saved report? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/domain-analysis/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      showError("Couldn't delete this report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Container>
      <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
        <BackToHome />
        <Link
          href="/domain-analysis"
          className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
        >
          <LineChart className="w-4 h-4" aria-hidden="true" />
          Analyse another domain
        </Link>
      </Wrapper>

      <h1 className="text-[#171717] text-[28px] font-bold mb-6">My Reports</h1>

      {items.length === 0 ? (
        <Wrapper className="bg-white rounded-2xl border border-black/5 shadow-6xl p-10 text-center mb-16">
          <FileBarChart className="w-10 h-10 mx-auto mb-3 text-black/20" aria-hidden="true" />
          <p className="text-[#475569] mb-4">You haven&apos;t unlocked any AI Growth Reports yet.</p>
          <Link
            href="/domain-analysis"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-dark-100 text-white font-medium hover:bg-dark-100/90 transition-colors duration-200"
          >
            <LineChart className="w-4 h-4" aria-hidden="true" />
            Analyse a domain
          </Link>
        </Wrapper>
      ) : (
        <Wrapper className="grid gap-3 mb-16">
          {items.map((item) => (
            <Wrapper
              key={item.id}
              className="bg-white rounded-2xl border border-black/5 shadow-6xl p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <Link href={`/domain-analysis/reports/${item.id}`} className="flex-1 min-w-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-dark-100/10 text-dark-100 text-xs font-medium mb-1.5">
                  AI Growth Report
                </span>
                <p className="text-[#171717] font-semibold truncate">{item.domain}</p>
                <p className="text-[#94a3b8] text-sm">{new Date(item.createdAt).toLocaleString()}</p>
              </Link>
              <button
                onClick={() => remove(item.id)}
                disabled={deletingId === item.id}
                aria-label={`Delete report for "${item.domain}"`}
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
