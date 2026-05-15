"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/admin/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-xl h-64 mb-6 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
    </div>
  ),
});

interface LiveSession {
  id: string;
  lat: number | null;
  lng: number | null;
  country: string | null;
  city: string | null;
  lastSeen: string;
  currentPath: string;
}

interface HeartbeatData {
  count: number;
  sessions: LiveSession[];
}

export default function LivePage() {
  const [data, setData] = useState<HeartbeatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/admin/heartbeat");
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/admin/login";
            return;
          }
          throw new Error("Failed to fetch");
        }
        setData(await res.json());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection lost");
      } finally {
        setLoading(false);
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 1000
    );
    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Live Users</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Polling every 5s
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300 text-sm mb-6">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Active count */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6 text-center">
            <p className="text-5xl font-bold text-green-400">{data.count}</p>
            <p className="text-sm text-gray-400 mt-1">
              active {data.count === 1 ? "user" : "users"} right now
            </p>
          </div>

          {/* Live user map */}
          <div className="bg-gray-800 rounded-xl mb-6 overflow-hidden">
            <LiveMap sessions={data.sessions} />
          </div>

          {/* Session table */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700">
              <h2 className="text-sm font-semibold text-gray-300">
                Active Sessions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm"
                aria-label="Active user sessions"
              >
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                    <th className="px-4 py-2 font-medium">Session ID</th>
                    <th className="px-4 py-2 font-medium">Path</th>
                    <th className="px-4 py-2 font-medium">City</th>
                    <th className="px-4 py-2 font-medium">Country</th>
                    <th className="px-4 py-2 font-medium text-right">
                      Last Seen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-4 py-2 text-gray-400 font-mono text-xs">
                        {s.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-2 text-gray-300">
                        {s.currentPath}
                      </td>
                      <td className="px-4 py-2 text-gray-400">
                        {s.city || "-"}
                      </td>
                      <td className="px-4 py-2 text-gray-400">
                        {s.country || "-"}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-500 text-xs">
                        {timeAgo(s.lastSeen)}
                      </td>
                    </tr>
                  ))}
                  {data.sessions.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No active sessions
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
