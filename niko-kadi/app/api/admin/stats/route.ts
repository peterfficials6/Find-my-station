import { NextResponse } from "next/server";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";
import { getActiveCount } from "@/lib/admin/heartbeat";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalCounties,
    totalConstituencies,
    verifiedCount,
    pendingCount,
    flaggedCount,
    totalContributions,
    todayContributions,
    totalContributors,
    totalFlags,
    countyBreakdown,
    recentContributions,
  ] = await Promise.all([
    prisma.county.count(),
    prisma.constituency.count(),
    prisma.constituency.count({ where: { verificationStatus: "verified" } }),
    prisma.constituency.count({ where: { verificationStatus: "pending" } }),
    prisma.constituency.count({ where: { verificationStatus: "flagged" } }),
    prisma.contribution.count(),
    prisma.contribution.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.contributorIdentity.count(),
    prisma.flag.count(),
    prisma.county.findMany({
      select: {
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
      take: 30,
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  // Build county breakdown
  const counties = countyBreakdown.map((c: typeof countyBreakdown[number]) => {
    const verified = c.constituencies.filter((x: { verificationStatus: string }) => x.verificationStatus === "verified").length;
    const pending = c.constituencies.filter((x: { verificationStatus: string }) => x.verificationStatus === "pending").length;
    return {
      name: c.name,
      slug: c.slug,
      total: c.constituencyCount,
      verified,
      pending,
      unverified: c.constituencyCount - verified - pending,
      pct: c.constituencyCount > 0 ? Math.round((verified / c.constituencyCount) * 100) : 0,
    };
  });

  // Contributions by day (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const contributionsByDay: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    contributionsByDay[d.toISOString().split("T")[0]] = 0;
  }
  recentContributions.forEach((c: { createdAt: Date }) => {
    const key = c.createdAt.toISOString().split("T")[0];
    if (contributionsByDay[key] !== undefined) contributionsByDay[key]++;
  });

  const contributionTimeSeries = Object.entries(contributionsByDay).map(([date, count]) => ({
    date,
    count,
  }));

  return NextResponse.json({
    overview: {
      totalCounties,
      totalConstituencies,
      verified: verifiedCount,
      pending: pendingCount,
      unverified: totalConstituencies - verifiedCount - pendingCount - flaggedCount,
      flagged: flaggedCount,
      totalContributions,
      todayContributions,
      totalContributors,
      totalFlags,
      activeUsers: getActiveCount(),
      verifiedPct: totalConstituencies > 0
        ? Math.round((verifiedCount / totalConstituencies) * 100)
        : 0,
    },
    counties,
    contributionTimeSeries,
  });
}
