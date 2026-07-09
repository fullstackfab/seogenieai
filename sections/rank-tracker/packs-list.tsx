"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, LineChart, Search } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { useToast } from "@/providers/toast-provider";
import { daysRemaining } from "@/lib/rank-tracker/pack-status";

type PackItem = {
  id: string;
  domain: string;
  keywordCount: number;
  purchasedAt: string;
  expiresAt: string;
  active: boolean;
};

export function PacksList({ items: initialItems }: { items: PackItem[] }) {
  const { showError } = useToast();
  const [items, setItems] = useState(initialItems);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm("Stop tracking this domain? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/rank-tracker/packs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, active: false } : item)));
    } catch {
      showError("Couldn't stop tracking. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }


  return (
    <Container>
      <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
        <BackToHome />
        <Link
          href="/rank-tracker"
          className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Track another domain
        </Link>
      </Wrapper>

      <h1 className="text-[#171717] text-[28px] font-bold mb-6">My Rank Trackers</h1>

      {items.length === 0 ? (
        <Wrapper className="bg-white rounded-2xl border border-black/5 shadow-6xl p-10 text-center mb-16">
          <LineChart className="w-10 h-10 mx-auto mb-3 text-black/20" aria-hidden="true" />
          <p className="text-[#475569] mb-4">You haven&apos;t set up any rank trackers yet.</p>
          <Link
            href="/rank-tracker"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-dark-100 text-white font-medium hover:bg-dark-100/90 transition-colors duration-200"
          >
            <LineChart className="w-4 h-4" aria-hidden="true" />
            Start tracking a domain
          </Link>
        </Wrapper>
      ) : (
        <Wrapper className="grid gap-3 mb-16">
          {items.map((item) => (
            <Wrapper
              key={item.id}
              className="bg-white rounded-2xl border border-black/5 shadow-6xl p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <Link href={`/rank-tracker/packs/${item.id}`} className="flex-1 min-w-0">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-1.5 ${
                    item.active ? "bg-green-500/10 text-green-600" : "bg-black/5 text-gray-500"
                  }`}
                >
                  {item.active ? `${daysRemaining(item.expiresAt)} days left` : "Expired"}
                </span>
                <p className="text-[#171717] font-semibold truncate">{item.domain}</p>
                <p className="text-[#94a3b8] text-sm">
                  {item.keywordCount} keyword{item.keywordCount === 1 ? "" : "s"} ·{" "}
                  {new Date(item.purchasedAt).toLocaleDateString()}
                </p>
              </Link>
              {item.active && (
                <button
                  onClick={() => remove(item.id)}
                  disabled={deletingId === item.id}
                  aria-label={`Stop tracking "${item.domain}"`}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </Wrapper>
          ))}
        </Wrapper>
      )}
    </Container>
  );
}
