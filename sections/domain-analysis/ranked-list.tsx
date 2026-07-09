"use client";

import { useState } from "react";

type RankedListProps = {
  values: Record<string, number>;
  heading: string;
  keyHead: string;
  valueHead: string;
};

/** Generic "top N with bar" list (ported from sessionGrouping.jsx, reused for channel/country breakdowns). */
export function RankedList({ values, heading, keyHead, valueHead }: RankedListProps) {
  const [show, setShow] = useState(false);
  const entries = Object.entries(values ?? {});
  const sum = entries.reduce((acc, [, v]) => acc + v, 0);
  const limit = show ? entries.length : 8;

  return (
    <div className="bg-white p-6 rounded-lg border-dark-100 mt-4 flex-1">
      <h2 className="text-2xl font-semibold text-dark-100 mb-2">{heading}</h2>
      <ul>
        <li className="relative flex justify-between border-b border-lightblue-100 py-2">
          <span>{keyHead}</span>
          <span>{valueHead}</span>
        </li>
        {entries.slice(0, limit).map(([key, value]) => (
          <li key={key} className="relative flex justify-between border-b border-lightblue-100 py-2">
            <span className="font-semibold">
              {key.slice(0, 30)}
              {key.length > 30 && "..."}
            </span>
            <span>{value}</span>
            <span
              style={{ width: `${sum > 0 ? (value / sum) * 100 : 0}%` }}
              className="absolute -bottom-[1px] left-0 bg-dark-100 h-[2px] transition-all duration-300"
            />
          </li>
        ))}
      </ul>
      {entries.length > 7 && (
        <button
          className="mx-auto block mt-4 underline underline-offset-4"
          onClick={() => setShow((v) => !v)}
        >
          {show ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );
}
