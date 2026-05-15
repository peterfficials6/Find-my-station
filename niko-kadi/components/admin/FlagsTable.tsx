"use client";

import { useState } from "react";

interface FlagRow {
  id: string;
  constituency: string;
  constituencySlug: string;
  reason: string;
  deviceFingerprint: string;
  createdAt: string;
}

export default function FlagsTable({ rows: initialRows }: { rows: FlagRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [dismissing, setDismissing] = useState<string | null>(null);

  async function handleDismiss(id: string) {
    if (!confirm("Dismiss this flag?")) return;
    setDismissing(id);
    try {
      const res = await fetch(`/api/admin/flags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to dismiss");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to dismiss flag. Please try again.");
    } finally {
      setDismissing(null);
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Flagged stations">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
              <th className="px-4 py-3 font-medium">Constituency</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium text-right">Date</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((flag) => (
              <tr
                key={flag.id}
                className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors"
              >
                <td className="px-4 py-3 text-white font-medium">
                  {flag.constituency}
                </td>
                <td className="px-4 py-3 text-gray-300">{flag.reason}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                  {flag.deviceFingerprint.slice(0, 12)}...
                </td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs">
                  {new Date(flag.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDismiss(flag.id)}
                    disabled={dismissing === flag.id}
                    aria-label={`Dismiss flag for ${flag.constituency}`}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-2 py-1"
                  >
                    {dismissing === flag.id ? "Dismissing..." : "Dismiss"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No flags to review
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
