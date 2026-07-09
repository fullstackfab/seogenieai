"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

const STASH_KEY = "keyword-planner:pending-save";

export type KeywordCollectionSavePayload = {
  name: string;
  seedKeywords: string[];
  location?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keywords: any[];
};

/**
 * Saves a Keyword Planner result set as a named collection against the
 * signed-in user. If nobody's signed in, stashes the payload and redirects
 * to Google sign-in first — searching stays sign-in-free, only saving
 * requires an account. Mirrors useContentSave's "resume after redirect"
 * pattern.
 */
export function useKeywordCollectionSave(onError: (message: string) => void) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const doSave = useCallback(
    async (payload: KeywordCollectionSavePayload) => {
      setSaving(true);
      try {
        const res = await fetch("/api/keyword-collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) throw new Error(data?.error ?? "Failed to save keywords.");
        router.push("/keyword-planner/collections");
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to save keywords.");
      } finally {
        setSaving(false);
      }
    },
    [router, onError]
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    const stashed = sessionStorage.getItem(STASH_KEY);
    if (!stashed) return;
    sessionStorage.removeItem(STASH_KEY);
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resumes a save stashed before the Google sign-in redirect
      void doSave(JSON.parse(stashed) as KeywordCollectionSavePayload);
    } catch {
      /* malformed stash — nothing to resume */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when auth status changes
  }, [status]);

  const save = useCallback(
    (payload: KeywordCollectionSavePayload) => {
      if (!session) {
        sessionStorage.setItem(STASH_KEY, JSON.stringify(payload));
        void signIn("google", { callbackUrl: "/keyword-planner" });
        return;
      }
      void doSave(payload);
    },
    [session, doSave]
  );

  return { save, saving };
}
