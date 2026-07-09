"use client";

import { Chart } from "react-google-charts";

const options = {
  legend: "none",
  vAxis: { direction: -1, title: "Position", minValue: 1 },
  hAxis: { title: "Date" },
  colors: ["#00668c"],
};

export function RankTrendChart({
  history,
}: {
  history: { date: string; position: number | null }[];
}) {
  const data: (string | number | null)[][] = [
    ["Date", "Position"],
    ...history.map((h) => [new Date(h.date).toLocaleDateString(), h.position]),
  ];

  return <Chart chartType="LineChart" width="100%" height="300px" data={data} options={options} />;
}
