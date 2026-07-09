"use client";

import { Chart } from "react-google-charts";

const options = {
  sizeAxis: false,
  colorAxis: { colors: ["#7c95e5", "#5470c6", "#174ea6"] },
  datalessRegionColor: "#dddddd",
  defaultColor: "#5470c6",
};

export function CountryChart({ values }: { values: Record<string, number> }) {
  const data: (string | number)[][] = [["Country", "Users"], ...Object.entries(values ?? {})];

  return (
    <div className="bg-white p-6 rounded-lg border-dark-100 mt-4 flex-[2]">
      <Chart chartType="GeoChart" width="100%" height="400px" data={data} options={options} />
    </div>
  );
}
