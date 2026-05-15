export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma/client";
import HomeShell from "./HomeShell";

async function getLocations(searchParams: Record<string, string | undefined>) {
  const search = searchParams.search?.slice(0, 100) || null;
  const county = searchParams.county || null;
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;
  const now = new Date();

  try {
    // Build office query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const officeWhere: Record<string, any> = {};
    if (county) officeWhere.county = { slug: county };
    if (search) {
      officeWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { officeLocation: { contains: search, mode: "insensitive" } },
        { landmark: { contains: search, mode: "insensitive" } },
        { county: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Build centre query (active only)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const centreWhere: Record<string, any> = { activeUntil: { gte: now } };
    if (county) centreWhere.constituency = { county: { slug: county } };
    if (search) {
      centreWhere.AND = [
        { activeUntil: { gte: now } },
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { ward: { name: { contains: search, mode: "insensitive" } } },
            { constituency: { name: { contains: search, mode: "insensitive" } } },
            { constituency: { county: { name: { contains: search, mode: "insensitive" } } } },
          ],
        },
      ];
      delete centreWhere.activeUntil;
    }

    const [offices, centres] = await Promise.all([
      prisma.constituency.findMany({
        where: officeWhere,
        include: { county: { select: { name: true, slug: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.registrationCentre.findMany({
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
      }),
    ]);

    // Merge into unified results
    const allResults = [
      // Active centres first during ECVR
      ...centres.map((row) => ({
        slug: row.slug,
        name: row.name,
        type: "centre" as const,
        ward: row.ward.name,
        constituency: row.constituency.name,
        constituency_slug: row.constituency.slug,
        county: row.constituency.county.name,
        county_slug: row.constituency.county.slug,
        office_location: null as string | null,
        status: row.verificationStatus,
        confirmations: row.confirmationCount,
        has_coordinates: !!(row.verifiedLat && row.verifiedLng),
        active_until: row.activeUntil?.toISOString() ?? null,
        is_active: true,
      })),
      // Then offices
      ...offices.map((row) => ({
        slug: row.slug,
        name: `${row.name} IEBC Office`,
        type: "office" as const,
        ward: null as string | null,
        constituency: row.name,
        constituency_slug: row.slug,
        county: row.county.name,
        county_slug: row.county.slug,
        office_location: row.officeLocation,
        status: row.verificationStatus,
        confirmations: row.confirmationCount,
        has_coordinates: !!(row.verifiedLat && row.verifiedLng),
        active_until: null as string | null,
        is_active: true,
      })),
    ];

    const total = allResults.length;
    const paged = allResults.slice(skip, skip + limit);

    return {
      data: paged,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  } catch {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const locations = await getLocations(resolvedParams);

  return (
    <HomeShell
      initialData={locations.data}
      initialPagination={locations.pagination}
      initialSearch={resolvedParams.search || ""}
    />
  );
}
