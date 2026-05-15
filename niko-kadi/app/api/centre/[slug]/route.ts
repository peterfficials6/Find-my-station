import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { generateNavigationLinks } from "@/lib/navigation/deep-links";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const centre = await prisma.registrationCentre.findUnique({
    where: { slug },
    include: {
      ward: { select: { name: true, slug: true } },
      constituency: {
        select: {
          name: true,
          slug: true,
          county: { select: { name: true, slug: true } },
        },
      },
      contributions: {
        include: {
          contributor: { select: { displayName: true, identityType: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!centre) {
    return NextResponse.json({ error: "Registration centre not found" }, { status: 404 });
  }

  const now = new Date();
  const isActive = centre.activeUntil ? centre.activeUntil >= now : true;

  const response: Record<string, unknown> = {
    id: centre.id,
    name: centre.name,
    slug: centre.slug,
    type: "centre",
    ward: { name: centre.ward.name, slug: centre.ward.slug },
    constituency: {
      name: centre.constituency.name,
      slug: centre.constituency.slug,
    },
    county: {
      name: centre.constituency.county.name,
      slug: centre.constituency.county.slug,
    },
    cycle_year: centre.cycleYear,
    active_from: centre.activeFrom?.toISOString() ?? null,
    active_until: centre.activeUntil?.toISOString() ?? null,
    is_active: isActive,
    verification: {
      status: centre.verificationStatus,
      confirmed_lat: centre.verifiedLat,
      confirmed_lng: centre.verifiedLng,
      confirmation_count: centre.confirmationCount,
      verified_at: centre.verifiedAt?.toISOString() ?? null,
    },
    contributions: centre.contributions.map((c) => ({
      id: c.id,
      lat: c.lat,
      lng: c.lng,
      contributor_name: c.contributor.displayName,
      identity_type: c.contributor.identityType,
      created_at: c.createdAt.toISOString(),
    })),
  };

  if (centre.verifiedLat && centre.verifiedLng) {
    response.navigation = generateNavigationLinks(
      centre.verifiedLat,
      centre.verifiedLng
    );
  }

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
    },
  });
}
