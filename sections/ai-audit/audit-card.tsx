"use client";

import { Check, TriangleAlert, X, Info, Lock } from "lucide-react";

const STATUS_CONFIG = {
  pass: {
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    label: "Pass",
    Icon: Check,
  },
  warn: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-500",
    label: "Warning",
    Icon: TriangleAlert,
  },
  fail: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    label: "Fail",
    Icon: X,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
    label: "Info",
    Icon: Info,
  },
} as const;
export function AuditCard({
  title,
  status,
  value,
  recommendation,
}: {
  title: string;
  status: keyof typeof STATUS_CONFIG;
  value?: string | null;
  recommendation?: string;
}) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.info;
  const { Icon } = cfg;

  return (
    <div className={`rounded-xl border p-5 ${cfg.bg} ${cfg.border} transition-all duration-200`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white ${cfg.dot}`}
          >
            <Icon className="w-3 h-3" />
          </span>
          <span className="font-semibold text-dark-100 text-sm">{title}</span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}
        >
          {cfg.label}
        </span>
      </div>
      {value && (
        <p className="text-sm text-dark-100 font-medium mb-1 break-all line-clamp-2">{value}</p>
      )}
      {recommendation && <p className="text-xs text-gray-500 leading-relaxed">{recommendation}</p>}
    </div>
  );
}

export function AuditCardLocked({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 relative overflow-hidden">
      <div className="blur-sm pointer-events-none select-none">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 text-white text-xs font-bold">
              ?
            </span>
            <span className="font-semibold text-dark-100 text-sm">{title}</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 whitespace-nowrap">
            ████
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-1">████████████████████</p>
        <p className="text-xs text-gray-300">███████████████████████████████</p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px]">
        <Lock className="w-6 h-6 mb-1 text-dark-100" />
        <span className="text-xs font-semibold text-dark-100 opacity-60">
          Unlock with Full Report
        </span>
      </div>
    </div>
  );
}
