import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { logApiCall, logSearch } from "@/lib/admin/tracking";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get("county");
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.slice(0, 100) || null;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (county) {
    where.county = { slug: county };
  }

  if (status) {
    where.verificationStatus = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { officeLocation: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.constituency.findMany({
      where,
      include: { county: { select: { name: true, slug: true } } },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.constituency.count({ where }),
  ]);

  const response = {
    data: data.map((row: typeof data[number]) => ({
      slug: row.slug,
      name: row.name,
      county: row.county.name,
      county_slug: row.county.slug,
      office_location: row.officeLocation,
      status: row.verificationStatus,
      confirmations: row.confirmationCount,
      has_coordinates: !!(row.verifiedLat && row.verifiedLng),
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };

  // Fire-and-forget tracking
  const ipHash = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  logApiCall("/api/constituencies", "GET", ipHash);
  if (search) logSearch(search, total, county, status);

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
    },
  });
}
