"use client";

import { Chart } from "react-google-charts";

const options = { title: "New users", bar: { groupWidth: "95%" }, legend: { position: "none" } };

export function NewUserChart({ values }: { values: Record<string, number> }) {
  const data: unknown[][] = [
    [
      "Element",
      "Density",
      { role: "style" },
      { sourceColumn: 0, role: "annotation", type: "string", calc: "stringify" },
    ],
    ...Object.entries(values ?? {}).map(([key, value]) => [key.toUpperCase(), value, "#7b94e5", null]),
  ];

  return (
    <div className="bg-white p-6 rounded-lg border-dark-100 mt-4 flex-[2]">
      <h2 className="text-2xl font-semibold text-dark-100 mb-2">Where do your new users come from?</h2>
      <Chart chartType="BarChart" width="100%" height="400px" data={data} options={options} />
    </div>
  );
}
