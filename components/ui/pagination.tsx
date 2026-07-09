"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  count,
  index,
  onChange,
}: {
  count: number;
  index: number;
  onChange: (page: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onChange(Math.max(0, index - 1))}
        disabled={index === 0}
        className="p-2 rounded-md disabled:opacity-40 hover:bg-gray-100"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="text-sm font-medium">
        {index + 1} / {count}
      </span>
      <button
        onClick={() => onChange(Math.min(count - 1, index + 1))}
        disabled={index === count - 1}
        className="p-2 rounded-md disabled:opacity-40 hover:bg-gray-100"
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
