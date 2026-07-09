"use client";

import { Globe } from "lucide-react";

export function ScoreHeader({
  url,
  domain,
  score,
  isPaid,
}: {
  url: string;
  domain: string;
  score: number;
  isPaid?: boolean;
}) {
  const scoreColor = score >= 70 ? "text-green-600" : score >= 40 ? "text-yellow-600" : "text-red-600";
  const scoreBg = score >= 70 ? "bg-green-50 border-green-200" : score >= 40 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  const barColor = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  const scoreLabel = score >= 70 ? "Good" : score >= 40 ? "Needs Work" : "Poor";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-dark-100" />
            <h1 className="text-xl font-bold text-dark-100 break-all">{domain}</h1>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-dark-100 transition-colors break-all underline underline-offset-2"
          >
            {url}
          </a>
          {isPaid && (
            <div className="mt-3">
              <span className="text-xs bg-dark-100 text-white px-3 py-1 rounded-full font-semibold">
                ✓ Full Report Unlocked
              </span>
            </div>
          )}
        </div>
        <div className={`flex flex-col items-center justify-center border rounded-2xl px-10 py-5 ${scoreBg}`}>
          <span className={`text-6xl font-black ${scoreColor}`}>{score}</span>
          <span className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider">AI Readiness Score</span>
          <span className={`text-sm font-bold mt-1 ${scoreColor}`}>{scoreLabel}</span>
        </div>
      </div>
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>0</span>
          <span>AI Readiness</span>
          <span>100</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div style={{ width: `${score}%` }} className={`h-full rounded-full transition-all duration-700 ${barColor}`} />
        </div>
      </div>
    </div>
  );
}
