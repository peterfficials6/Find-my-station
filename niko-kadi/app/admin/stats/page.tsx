import { redirect } from "next/navigation";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";
import ContributionsChart from "@/components/admin/ContributionsChart";

export const metadata = { title: "County Stats" };

export default async function StatsPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [countyBreakdown, recentContributions] = await Promise.all([
    prisma.county.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        constituencyCount: true,
        constituencies: {
          select: { verificationStatus: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.contribution.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const counties = countyBreakdown.map((c: typeof countyBreakdown[number]) => {
    const verified = c.constituencies.filter(
      (x: { verificationStatus: string }) => x.verificationStatus === "verified"
    ).length;
    const pending = c.constituencies.filter(
      (x: { verificationStatus: string }) => x.verificationStatus === "pending"
    ).length;
    const unverified = c.constituencyCount - verified - pending;
    const pct =
      c.constituencyCount > 0
        ? Math.round((verified / c.constituencyCount) * 100)
        : 0;
    return { name: c.name, slug: c.slug, total: c.constituencyCount, verified, pending, unverified, pct };
  });

  // Build time series for last 30 days
  const contributionsByDay: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    contributionsByDay[d.toISOString().split("T")[0]] = 0;
  }
  recentContributions.forEach((c: { createdAt: Date }) => {
    const key = c.createdAt.toISOString().split("T")[0];
    if (contributionsByDay[key] !== undefined) contributionsByDay[key]++;
  });
  const timeSeries = Object.entries(contributionsByDay).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">County Stats</h1>

      {/* Contributions over time chart */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">
          Contributions Over Time (30 days)
        </h2>
        <ContributionsChart data={timeSeries} />
      </div>

      {/* County breakdown table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-300">
            County Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="County breakdown table">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                <th className="px-4 py-3 font-medium">County</th>
                <th className="px-4 py-3 font-medium text-right">Verified</th>
                <th className="px-4 py-3 font-medium text-right">Pending</th>
                <th className="px-4 py-3 font-medium text-right">Unverified</th>
                <th className="px-4 py-3 font-medium w-48">Progress</th>
              </tr>
            </thead>
            <tbody>
              {counties.map((county: { name: string; slug: string; total: number; verified: number; pending: number; unverified: number; pct: number }) => (
                <tr
                  key={county.slug}
                  className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {county.name}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400">
                    {county.verified}
                  </td>
                  <td className="px-4 py-3 text-right text-yellow-400">
                    {county.pending}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {county.unverified}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-green-500"
                            style={{
                              width: `${county.total > 0 ? (county.verified / county.total) * 100 : 0}%`,
                            }}
                          />
                          <div
                            className="bg-yellow-500"
                            style={{
                              width: `${county.total > 0 ? (county.pending / county.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {county.pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
