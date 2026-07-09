"use client";

import { useState } from "react";
import type { PageRow } from "./types";

export function MostPopular({
  values,
  heading,
  keyHead,
  valueHead,
}: {
  values: PageRow[];
  heading: string;
  keyHead: string;
  valueHead: string;
}) {
  const [show, setShow] = useState(false);
  const sorted = [...(values ?? [])].sort(
    (a, b) => Number(b[5].activeUsers) - Number(a[5].activeUsers)
  );
  const sum = sorted.reduce((acc, item) => acc + Number(item[5].activeUsers), 0);
  const limit = show ? sorted.length : 8;

  return (
    <div className="bg-white p-6 rounded-lg border-dark-100 mt-4 flex-1">
      <h2 className="text-2xl font-semibold text-dark-100 mb-2">{heading}</h2>
      <ul>
        <li className="relative flex justify-between border-b border-lightblue-100 py-2">
          <span>{keyHead}</span>
          <span>{valueHead}</span>
        </li>
        {sorted.slice(0, limit).map((item, i) => (
          <li key={i} className="relative flex justify-between border-b border-lightblue-100 py-2">
            <span className="font-semibold">
              <a href={`http://${item[2]}${item[0]}`} target="_blank" rel="noopener noreferrer">
                {item[1] ? item[1].slice(0, 30) : "(not set)"}
                {item[1]?.length > 30 && "..."}
              </a>
            </span>
            <span>{item[5].activeUsers}</span>
            <span
              style={{ width: `${sum > 0 ? (Number(item[5].activeUsers) / sum) * 100 : 0}%` }}
              className="absolute -bottom-[1px] left-0 bg-dark-100 h-[2px] transition-all duration-300"
            />
          </li>
        ))}
      </ul>
      {sorted.length > 7 && (
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
