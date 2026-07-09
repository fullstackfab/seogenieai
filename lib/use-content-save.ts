"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

const STASH_KEY = "content-writer:pending-save";

export type ContentSavePayload = {
  contentType: string;
  topic: string;
  tone: string;
  length: string;
  keywords: string[];
  html: string;
};

/**
 * Saves a generated result against the signed-in user. If nobody's signed in
 * yet, stashes the payload and redirects to Google sign-in first — Content
 * Writer itself stays sign-in-free, only saving requires an account. Mirrors
 * the "resume after redirect" pattern already used by the insight page's
 * Stripe return flow.
 */
export function useContentSave(onError: (message: string) => void) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const doSave = useCallback(
    async (payload: ContentSavePayload) => {
      setSaving(true);
      try {
        const res = await fetch("/api/content-writer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) throw new Error(data?.error ?? "Failed to save content.");
        router.push(`/content-writer/${data.id}`);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to save content.");
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
      void doSave(JSON.parse(stashed) as ContentSavePayload);
    } catch {
      /* malformed stash — nothing to resume */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when auth status changes
  }, [status]);

  const save = useCallback(
    (payload: ContentSavePayload) => {
      if (!session) {
        sessionStorage.setItem(STASH_KEY, JSON.stringify(payload));
        void signIn("google", { callbackUrl: "/content-writer" });
        return;
      }
      void doSave(payload);
    },
    [session, doSave]
  );

  return { save, saving };
}
