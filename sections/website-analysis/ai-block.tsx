"use client";

import { DataTable } from "./ui";

type AiVisibilityData = {
  brandName?: string;
  brandDescription?: string;
  companyUrl?: string | null;
  brandAwareness?: "High" | "Medium" | "Low" | "Unknown" | string;
  sentiment?: "Positive" | "Neutral" | "Negative" | string;
  credibility?: string;
  topTopics?: string[];
  topCompetitors?: string[];
  relatedPrompts?: string[];
  servicesProducts?: string[];
};

const AWARENESS_STYLE: Record<string, string> = {
  High: "text-green-600 bg-green-50",
  Medium: "text-yellow-600 bg-yellow-50",
  Low: "text-red-600 bg-red-50",
  Unknown: "text-black/40 bg-black/5",
};

const SENTIMENT_STYLE: Record<string, string> = {
  Positive: "text-green-600 bg-green-50",
  Neutral: "text-blue-600 bg-blue-50",
  Negative: "text-red-600 bg-red-50",
};

function Chip({ text }: { text: string }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full border-2 border-black/10 text-dark-100">{text}</span>
  );
}

/** Renders one AI model's brand-perception report (ChatGPT / Gemini / Perplexity). */
export function AiBlock({ label, rawData }: { label: string; rawData: AiVisibilityData | null }) {
  if (!rawData) return null;

  const awareness = rawData.brandAwareness ?? "Unknown";
  const sentiment = rawData.sentiment ?? "Neutral";
  const topics = rawData.topTopics?.slice(0, 6) ?? [];
  const competitors = rawData.topCompetitors?.slice(0, 5) ?? [];
  const prompts = rawData.relatedPrompts?.slice(0, 5) ?? [];
  const services = rawData.servicesProducts?.slice(0, 6) ?? [];

  return (
    <div className="flex-1 min-w-70 border-2 border-black/10 rounded-[10px] overflow-hidden">
      <div className="px-5 py-4 border-b-2 border-black/10 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-dark-100">{label}</h3>
        {rawData.companyUrl && (
          <a
            href={rawData.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-dark-100 underline underline-offset-2 opacity-60 hover:opacity-100"
          >
            {rawData.companyUrl.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>

      <div className="px-5 py-4">
        {rawData.brandDescription && (
          <p className="text-sm opacity-60 mb-5 leading-relaxed">{rawData.brandDescription}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-5">
          <div className={`rounded-[10px] px-4 py-3 flex-1 min-w-30 ${AWARENESS_STYLE[awareness] ?? AWARENESS_STYLE.Unknown}`}>
            <span className="block text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-1">Brand Awareness</span>
            <span className="text-lg font-bold">{awareness}</span>
          </div>
          <div className={`rounded-[10px] px-4 py-3 flex-1 min-w-30 ${SENTIMENT_STYLE[sentiment] ?? SENTIMENT_STYLE.Neutral}`}>
            <span className="block text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-1">Sentiment</span>
            <span className="text-lg font-bold">{sentiment}</span>
          </div>
        </div>

        {rawData.credibility && (
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-2">Credibility</p>
            <p className="text-xs opacity-70 leading-relaxed">{rawData.credibility}</p>
          </div>
        )}

        {services.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-2">Services &amp; Products</p>
            <div className="flex flex-wrap gap-1.5">
              {services.map((s, i) => <Chip key={i} text={s} />)}
            </div>
          </div>
        )}

        {topics.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-2">Top Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t, i) => <Chip key={i} text={t} />)}
            </div>
          </div>
        )}

        {prompts.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-2">Related Prompts</p>
            <div className="flex flex-wrap gap-1.5">
              {prompts.map((p, i) => <Chip key={i} text={p} />)}
            </div>
          </div>
        )}

        {competitors.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-2">Top Competitors</p>
            <DataTable headers={["Brand"]} rows={competitors.map((c) => [c])} emptyMsg="" />
          </div>
        )}
      </div>
    </div>
  );
}
