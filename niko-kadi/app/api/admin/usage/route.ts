import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") || "7")));

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [pageViews, apiCalls, searches, recentSearches] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    prisma.apiCall.count({ where: { createdAt: { gte: since } } }),
    prisma.searchLog.count({ where: { createdAt: { gte: since } } }),
    prisma.searchLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { query: true, resultCount: true, county: true, createdAt: true },
    }),
  ]);

  // Top endpoints
  const allCalls = await prisma.apiCall.findMany({
    where: { createdAt: { gte: since } },
    select: { endpoint: true },
  });
  const endpointCounts: Record<string, number> = {};
  allCalls.forEach((c: { endpoint: string }) => {
    endpointCounts[c.endpoint] = (endpointCounts[c.endpoint] || 0) + 1;
  });
  const topEndpoints = Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top pages
  const allViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { path: true },
  });
  const pathCounts: Record<string, number> = {};
  allViews.forEach((v: { path: string }) => {
    pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
  });
  const topPages = Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    period: { days, since: since.toISOString() },
    totals: { pageViews, apiCalls, searches },
    topEndpoints,
    topPages,
    recentSearches,
  });
}
