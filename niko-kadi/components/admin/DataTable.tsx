"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Row {
  id: string;
  name: string;
  slug: string;
  county: string;
  status: string;
  confirmations: number;
  hasGps: boolean;
}

type SortKey = "name" | "county" | "status" | "confirmations";
type SortDir = "asc" | "desc";

const statusColors: Record<string, string> = {
  verified: "text-green-400 bg-green-400/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  flagged: "text-red-400 bg-red-400/10",
  unverified: "text-gray-400 bg-gray-400/10",
};

export default function DataTable({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.county.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [rows, search, sortKey, sortDir]);

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  }

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, county, or status..."
          aria-label="Filter stations"
          className="w-full sm:w-80 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        />
      </div>
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Station data table">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                <th className="px-4 py-3 font-medium">
                  <button
                    onClick={() => handleSort("name")}
                    className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                  >
                    Name{sortIcon("name")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">
                  <button
                    onClick={() => handleSort("county")}
                    className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                  >
                    County{sortIcon("county")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">
                  <button
                    onClick={() => handleSort("status")}
                    className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                  >
                    Status{sortIcon("status")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  <button
                    onClick={() => handleSort("confirmations")}
                    className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                  >
                    Confirmations{sortIcon("confirmations")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-center">Has GPS</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{row.county}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status] || statusColors.unverified}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {row.confirmations}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.hasGps ? (
                      <span className="text-green-400" aria-label="Has GPS coordinates">Yes</span>
                    ) : (
                      <span className="text-gray-500" aria-label="No GPS coordinates">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/station/${row.slug}`}
                      target="_blank"
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {search ? "No matching stations" : "No station data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
          {filtered.length} of {rows.length} stations
        </div>
      </div>
    </>
  );
}
