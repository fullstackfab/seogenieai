/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { fetchSeoTool } from "@/lib/use-seo-tool";
import { SectionCard, Loader } from "../ui";
import { AiBlock } from "../ai-block";

export function AiVisibilitySection({ domain }: { domain: string }) {
  const [brand, setBrand] = useState(domain);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatgptData, setChatgptData] = useState<any>(null);
  const [geminiData, setGeminiData] = useState<any>(null);
  const [hasRun, setHasRun] = useState(false);

  async function fetchAll() {
    if (!brand.trim()) {
      setError("Brand name or domain is required.");
      return;
    }
    setError("");
    setLoading(true);
    setChatgptData(null);
    setGeminiData(null);
    const [c, g] = await Promise.allSettled([
      fetchSeoTool("ai-visibility/chatgpt", { brand }),
      fetchSeoTool("ai-visibility/gemini", { brand }),
    ]);
    if (c.status === "fulfilled") setChatgptData(c.value);
    if (g.status === "fulfilled") setGeminiData(g.value);
    if (c.status === "rejected" && g.status === "rejected") {
      setError("Both AI visibility requests failed.");
    }
    setLoading(false);
    setHasRun(true);
  }

  return (
    <SectionCard title="AI Visibility" icon={<Sparkles size={15} />}>
      <div className="mb-5 pb-5 border-b border-black/10">
        <p className="text-sm opacity-60 mb-3">
          Check how ChatGPT and Gemini perceive your brand. Pre-filled with the domain — adjust if
          your brand name differs.
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="ai-brand" className="block text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-1.5">
              Brand Name
            </label>
            <input
              id="ai-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAll()}
              placeholder="e.g. Nike, Apple, jaxxon.com"
              className="w-full p-3 border-2 border-black/20 rounded-[10px] text-sm bg-transparent focus:border-dark-100 focus:outline-none placeholder:opacity-40"
            />
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="pt-[7px] pb-2 px-[21px] text-base font-normal rounded-[9px] border border-dark-100 bg-dark-100 text-white hover:bg-transparent hover:text-dark-100 transition-colors duration-300 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Checking…" : "Check AI Visibility"}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {loading && <Loader label="Querying ChatGPT & Gemini…" />}
      {!loading && hasRun && (chatgptData || geminiData) && (
        <div className="flex flex-wrap gap-4">
          <AiBlock label="ChatGPT" rawData={chatgptData} />
          <AiBlock label="Gemini" rawData={geminiData} />
        </div>
      )}
      {!loading && hasRun && !chatgptData && !geminiData && !error && (
        <p className="text-sm opacity-50 py-2">No results returned. Try a different brand name.</p>
      )}
      {!hasRun && !loading && <p className="text-sm opacity-40 py-2">Results will appear here after you run the check.</p>}
    </SectionCard>
  );
}
