"use client";

import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import type { PageRow } from "./types";

const LIMIT = 10;

export function PageReportTable({ values }: { values: PageRow[] }) {
  const [page, setPage] = useState(0);
  const rows = values ?? [];
  const count = Math.ceil(rows.length / LIMIT);
  const pageRows = useMemo(() => rows.slice(page * LIMIT, (page + 1) * LIMIT), [rows, page]);

  return (
    <div className="bg-white p-6 rounded-lg border-dark-100 mt-4">
      <h2 className="text-2xl font-semibold text-dark-100 mb-6">Views by Pages</h2>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2">Sr.no</th>
              <th className="p-2 text-left">Page Title</th>
              <th className="p-2">Country</th>
              <th className="p-2">Screen Page Views</th>
              <th className="p-2">Users</th>
              <th className="p-2">New Users</th>
              <th className="p-2">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((item, i) => (
              <tr key={`${item[0]}-${i}`}>
                <td className="p-2 text-center">{page * LIMIT + i + 1}</td>
                <td className="p-2 text-left">
                  <a href={`http://${item[2]}${item[0]}`} target="_blank" rel="noopener noreferrer">
                    {item[1] || "(not set)"}
                  </a>
                </td>
                <td className="p-2 text-center">{item[3]}</td>
                <td className="p-2 text-center">{item[4]?.screenPageViews}</td>
                <td className="p-2 text-center">{item[5]?.activeUsers}</td>
                <td className="p-2 text-center">{item[6]?.newUsers}</td>
                <td className="p-2 text-center">{item[7]?.sessions}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination count={count} index={page} onChange={setPage} />
      </div>
    </div>
  );
}
