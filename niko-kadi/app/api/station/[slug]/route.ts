import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { generateNavigationLinks } from "@/lib/navigation/deep-links";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const constituency = await prisma.constituency.findUnique({
    where: { slug },
    include: {
      county: { select: { name: true, slug: true } },
      contributions: {
        include: {
          contributor: { select: { displayName: true, identityType: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!constituency) {
    return NextResponse.json({ error: "Constituency not found" }, { status: 404 });
  }

  const response: Record<string, unknown> = {
    id: constituency.id,
    name: constituency.name,
    slug: constituency.slug,
    county: {
      name: constituency.county.name,
      slug: constituency.county.slug,
    },
    office_location: constituency.officeLocation,
    landmark: constituency.landmark,
    distance_to_office: constituency.distanceToOffice,
    verification: {
      status: constituency.verificationStatus,
      confirmed_lat: constituency.verifiedLat,
      confirmed_lng: constituency.verifiedLng,
      confirmation_count: constituency.confirmationCount,
      verified_at: constituency.verifiedAt,
    },
    contributions: constituency.contributions.map((c: typeof constituency.contributions[number]) => ({
      id: c.id,
      lat: c.lat,
      lng: c.lng,
      contributor_name: c.contributor.displayName,
      identity_type: c.contributor.identityType,
      created_at: c.createdAt,
    })),
  };

  if (constituency.verifiedLat && constituency.verifiedLng) {
    response.navigation = generateNavigationLinks(
      constituency.verifiedLat,
      constituency.verifiedLng
    );
  }

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
    },
  });
}
