"use client";

import { useState, useEffect, useCallback } from "react";

interface UsageData {
  period: { days: number; since: string };
  totals: { pageViews: number; apiCalls: number; searches: number };
  topEndpoints: { endpoint: string; count: number }[];
  topPages: { path: string; count: number }[];
  recentSearches: {
    query: string;
    resultCount: number;
    county: string | null;
    createdAt: string;
  }[];
}

const DAY_OPTIONS = [7, 14, 30, 90] as const;

export default function UsagePage() {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/usage?days=${days}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to load usage data");
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Usage Analytics</h1>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              aria-label={`Show last ${d} days`}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                days === d
                  ? "bg-gray-700 text-white font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: "Page Views", value: data.totals.pageViews, color: "text-blue-400" },
              { label: "API Calls", value: data.totals.apiCalls, color: "text-green-400" },
              { label: "Searches", value: data.totals.searches, color: "text-yellow-400" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Top endpoints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-gray-300">
                  Top Endpoints
                </h2>
              </div>
              <table className="w-full text-sm" aria-label="Top API endpoints">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                    <th className="px-4 py-2 font-medium">Endpoint</th>
                    <th className="px-4 py-2 font-medium text-right">Hits</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topEndpoints.map((ep) => (
                    <tr
                      key={ep.endpoint}
                      className="border-b border-gray-700/50"
                    >
                      <td className="px-4 py-2 text-gray-300 font-mono text-xs">
                        {ep.endpoint}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-400">
                        {ep.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {data.topEndpoints.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Top pages */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-gray-300">
                  Top Pages
                </h2>
              </div>
              <table className="w-full text-sm" aria-label="Top pages by views">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                    <th className="px-4 py-2 font-medium">Path</th>
                    <th className="px-4 py-2 font-medium text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((pg) => (
                    <tr key={pg.path} className="border-b border-gray-700/50">
                      <td className="px-4 py-2 text-gray-300 font-mono text-xs">
                        {pg.path}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-400">
                        {pg.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {data.topPages.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent searches */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700">
              <h2 className="text-sm font-semibold text-gray-300">
                Recent Searches
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Recent searches">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                    <th className="px-4 py-2 font-medium">Query</th>
                    <th className="px-4 py-2 font-medium">County</th>
                    <th className="px-4 py-2 font-medium text-right">
                      Results
                    </th>
                    <th className="px-4 py-2 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSearches.map((s, i) => (
                    <tr key={i} className="border-b border-gray-700/50">
                      <td className="px-4 py-2 text-gray-300">{s.query}</td>
                      <td className="px-4 py-2 text-gray-400">
                        {s.county || "-"}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-400">
                        {s.resultCount}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-500 text-xs">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {data.recentSearches.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No searches yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
