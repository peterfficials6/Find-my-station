import { prisma } from "@/lib/prisma/client";

export function logPageView(path: string, ipHash: string, userAgent?: string) {
  prisma.pageView
    .create({ data: { path, ipHash, userAgent } })
    .catch(() => {}); // fire-and-forget
}

export function logApiCall(endpoint: string, method: string, ipHash: string) {
  prisma.apiCall
    .create({ data: { endpoint, method, ipHash } })
    .catch(() => {});
}

export function logSearch(
  query: string,
  resultCount: number,
  county?: string | null,
  status?: string | null
) {
  prisma.searchLog
    .create({ data: { query, resultCount, county, status } })
    .catch(() => {});
}
