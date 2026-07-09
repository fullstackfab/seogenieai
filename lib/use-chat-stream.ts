"use client";

import { useState, useCallback } from "react";
import { stripCodeFence } from "@/lib/strip-code-fence";

type ChatFlags = {
  nonHtmlResponse?: boolean;
  keyWordsContent?: boolean;
  analyticsReport?: boolean;
  pageSpeedInsights?: boolean;
  contentWriter?: boolean;
  contentType?: string;
  tone?: string;
  length?: "short" | "medium" | "long";
  keywords?: string[];
  country?: string;
  state?: string;
  city?: string;
  stripeSessionId?: string;
};

/** Streams a chat completion from /api/chat, exposing incremental text. */
export function useChatStream() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = useCallback(async (userPrompt: string, flags: ChatFlags = {}) => {
    setAnswer("");
    setFailed(false);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt, ...flags }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? res.statusText);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAnswer(stripCodeFence(full));
      }
      return { success: true, answer: stripCodeFence(full) };
    } catch (err) {
      setFailed(true);
      return { success: false, answer: "", error: err instanceof Error ? err.message : undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  return { answer, loading, failed, run, setAnswer };
}
