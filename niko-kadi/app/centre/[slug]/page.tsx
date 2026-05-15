export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { generateNavigationLinks } from "@/lib/navigation/deep-links";
import CentreShell from "./CentreShell";

async function getCentre(slug: string) {
  try {
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

    if (!centre) return null;

    const now = new Date();

    return {
      id: centre.id,
      name: centre.name,
      slug: centre.slug,
      ward: { name: centre.ward.name, slug: centre.ward.slug },
      constituency: { name: centre.constituency.name, slug: centre.constituency.slug },
      county: { name: centre.constituency.county.name, slug: centre.constituency.county.slug },
      cycle_year: centre.cycleYear,
      active_from: centre.activeFrom?.toISOString() ?? null,
      active_until: centre.activeUntil?.toISOString() ?? null,
      is_active: centre.activeUntil ? centre.activeUntil >= now : true,
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
      navigation: centre.verifiedLat && centre.verifiedLng
        ? generateNavigationLinks(centre.verifiedLat, centre.verifiedLng)
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const centre = await getCentre(slug);
  if (!centre) return { title: "Centre Not Found" };

  return {
    title: `${centre.name} — ${centre.ward.name} Ward, ${centre.constituency.name}`,
    description: `Find the IEBC voter registration centre at ${centre.name} in ${centre.ward.name} ward, ${centre.constituency.name} constituency, ${centre.county.name} County.`,
  };
}

export default async function CentrePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const centre = await getCentre(slug);
  if (!centre) notFound();

  return <CentreShell centre={centre} />;
}
