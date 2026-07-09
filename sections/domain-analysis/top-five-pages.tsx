"use client";

import { Chart } from "react-google-charts";
import type { PageRow } from "./types";

const options = { title: "Top 5", bar: { groupWidth: "95%" }, legend: { position: "none" } };

export function TopFivePages({ values }: { values: PageRow[] }) {
  const sorted = [...(values ?? [])].sort(
    (a, b) => Number(b[7].sessions) - Number(a[7].sessions)
  );
  const data: (string | number)[][] = [
    ["Page Title", "Sessions"],
    ...sorted.slice(0, 5).map((item) => [
      item[1].length > 25 ? item[1].slice(0, 25) + "..." : item[1],
      parseFloat(item[7].sessions),
    ]),
  ];

  return (
    <div className="bg-white p-6 rounded-lg border-dark-100 mt-4 flex-[2]">
      <h2 className="text-2xl font-semibold text-dark-100 mb-2">Top 5 Visited Pages By Sessions</h2>
      <Chart chartType="Bar" width="100%" height="400px" data={data} options={options} />
    </div>
  );
}
