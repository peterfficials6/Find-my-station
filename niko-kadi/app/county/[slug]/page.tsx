export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import PageShell from "@/components/layout/PageShell";
import StationCard from "@/components/ui/StationCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const county = await prisma.county.findUnique({
    where: { slug },
    select: { name: true },
  });

  const countyName = county?.name ?? slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `IEBC Offices in ${countyName} County`,
    description: `Find all IEBC voter registration offices in ${countyName} County, Kenya.`,
  };
}

export default async function CountyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const county = await prisma.county.findUnique({
    where: { slug },
    include: {
      constituencies: {
        orderBy: { name: "asc" },
      },
    },
  });

  const countyName = county?.name ?? slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const constituencies = (county?.constituencies ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    county: countyName,
    county_slug: slug,
    status: row.verificationStatus,
    confirmations: row.confirmationCount,
    has_coordinates: !!(row.verifiedLat && row.verifiedLng),
  }));

  const verified = constituencies.filter((c) => c.status === "verified").length;

  return (
    <PageShell title={`${countyName} County`}>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{countyName} County</h1>
        <p className="text-xs text-gray-500 mt-1">
          {constituencies.length} constituencies &middot; {verified} verified
        </p>
      </div>

      <div className="space-y-2">
        {constituencies.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-500">
            No constituencies found for this county.
          </p>
        ) : (
          constituencies.map((station) => (
            <StationCard key={station.slug} {...station} />
          ))
        )}
      </div>
    </PageShell>
  );
}
