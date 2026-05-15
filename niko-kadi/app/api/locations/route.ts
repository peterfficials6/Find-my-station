import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { logApiCall, logSearch } from "@/lib/admin/tracking";

interface LocationResult {
  slug: string;
  name: string;
  type: "office" | "centre";
  ward: string | null;
  constituency: string;
  constituency_slug: string;
  county: string;
  county_slug: string;
  office_location: string | null;
  status: string;
  confirmations: number;
  has_coordinates: boolean;
  active_from: string | null;
  active_until: string | null;
  is_active: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.slice(0, 100) || null;
  const county = searchParams.get("county");
  const constituency = searchParams.get("constituency");
  const type = searchParams.get("type"); // "office" | "centre" | null (both)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  const userLat = parseFloat(searchParams.get("lat") || "");
  const userLng = parseFloat(searchParams.get("lng") || "");
  const hasUserLocation = !isNaN(userLat) && !isNaN(userLng);

  const now = new Date();
  const results: (LocationResult & { _lat?: number | null; _lng?: number | null })[] = [];

  // Query offices (unless type=centre)
  if (type !== "centre") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const officeWhere: Record<string, any> = {};

    if (county) officeWhere.county = { slug: county };
    if (constituency) officeWhere.slug = constituency;
    if (search) {
      officeWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { officeLocation: { contains: search, mode: "insensitive" } },
        { landmark: { contains: search, mode: "insensitive" } },
        { county: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const offices = await prisma.constituency.findMany({
      where: officeWhere,
      include: { county: { select: { name: true, slug: true } } },
      orderBy: { name: "asc" },
    });

    for (const row of offices) {
      results.push({
        slug: row.slug,
        name: `${row.name} IEBC Office`,
        type: "office",
        ward: null,
        constituency: row.name,
        constituency_slug: row.slug,
        county: row.county.name,
        county_slug: row.county.slug,
        office_location: row.officeLocation,
        status: row.verificationStatus,
        confirmations: row.confirmationCount,
        has_coordinates: !!(row.verifiedLat && row.verifiedLng),
        active_from: null,
        active_until: null,
        is_active: true,
        _lat: row.verifiedLat,
        _lng: row.verifiedLng,
      });
    }
  }

  // Query registration centres (unless type=office)
  if (type !== "office") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const centreWhere: Record<string, any> = {};

    // By default only show active centres
    const includeExpired = searchParams.get("include_expired") === "true";
    if (!includeExpired) {
      centreWhere.activeUntil = { gte: now };
    }

    if (county) centreWhere.constituency = { county: { slug: county } };
    if (constituency) centreWhere.constituency = { slug: constituency };
    if (search) {
      centreWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { ward: { name: { contains: search, mode: "insensitive" } } },
        { constituency: { name: { contains: search, mode: "insensitive" } } },
        { constituency: { county: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const centres = await prisma.registrationCentre.findMany({
      where: centreWhere,
      include: {
        ward: { select: { name: true } },
        constituency: {
          select: {
            name: true,
            slug: true,
            county: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    for (const row of centres) {
      const isActive = row.activeUntil ? row.activeUntil >= now : true;
      results.push({
        slug: row.slug,
        name: row.name,
        type: "centre",
        ward: row.ward.name,
        constituency: row.constituency.name,
        constituency_slug: row.constituency.slug,
        county: row.constituency.county.name,
        county_slug: row.constituency.county.slug,
        office_location: null,
        status: row.verificationStatus,
        confirmations: row.confirmationCount,
        has_coordinates: !!(row.verifiedLat && row.verifiedLng),
        active_from: row.activeFrom?.toISOString() ?? null,
        active_until: row.activeUntil?.toISOString() ?? null,
        is_active: isActive,
        _lat: row.verifiedLat,
        _lng: row.verifiedLng,
      });
    }
  }

  // Haversine distance in km
  function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  if (hasUserLocation) {
    // Sort by proximity to user
    results.sort((a, b) => {
      const distA = a._lat != null && a._lng != null ? distanceKm(userLat, userLng, a._lat, a._lng) : Infinity;
      const distB = b._lat != null && b._lng != null ? distanceKm(userLat, userLng, b._lat, b._lng) : Infinity;
      return distA - distB;
    });
  } else {
    // Default: active centres first, then offices, alphabetical
    results.sort((a, b) => {
      if (a.type === "centre" && a.is_active && !(b.type === "centre" && b.is_active)) return -1;
      if (b.type === "centre" && b.is_active && !(a.type === "centre" && a.is_active)) return 1;
      if (a.type === "office" && b.type !== "office") return -1;
      if (b.type === "office" && a.type !== "office") return 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Paginate and strip internal fields
  const total = results.length;
  const skip = (page - 1) * limit;
  const paged = results.slice(skip, skip + limit).map(({ _lat, _lng, ...rest }) => rest);

  const response = {
    data: paged,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };

  // Tracking
  const ipHash = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  logApiCall("/api/locations", "GET", ipHash);
  if (search) logSearch(search, total, county, null);

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
    },
  });
}
