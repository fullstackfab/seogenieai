"use client";

import { useEffect, useState } from "react";

type State<T> = { loading: boolean; error: string | null; data: T | null };

/** Parses a fetch Response as JSON, tolerating a non-JSON body (e.g. an HTML error page). */
async function parseJsonSafely(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetches a /api/seo/[tool] endpoint on mount (or whenever `deps` change). */
export function useSeoTool<T = unknown>(tool: string, body: Record<string, unknown>): State<T> {
  const [state, setState] = useState<State<T>>({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state for the new tool/body before refetching
    setState({ loading: true, error: null, data: null });

    (async () => {
      try {
        const res = await fetch(`/api/seo/${tool}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await parseJsonSafely(res);
        if (cancelled) return;

        if (!res.ok) {
          const message = (json?.error as string | undefined) ?? `Request failed (${res.status})`;
          setState({ loading: false, error: message, data: null });
          return;
        }
        setState({ loading: false, error: null, data: json as T });
      } catch (err) {
        if (!cancelled) {
          setState({
            loading: false,
            error: err instanceof Error ? err.message : "Network error. Please try again.",
            data: null,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, JSON.stringify(body)]);

  return state;
}

/** One-shot version for interactively-triggered fetches (e.g. AI Visibility). */
export async function fetchSeoTool<T = unknown>(tool: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/seo/${tool}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJsonSafely(res);
  if (!res.ok) {
    const message = (json?.error as string | undefined) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json as T;
}
