import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const [total, verified, pending, unverified, flagged, totalContributions, totalContributors] =
    await Promise.all([
      prisma.constituency.count(),
      prisma.constituency.count({ where: { verificationStatus: "verified" } }),
      prisma.constituency.count({ where: { verificationStatus: "pending" } }),
      prisma.constituency.count({ where: { verificationStatus: "unverified" } }),
      prisma.constituency.count({ where: { verificationStatus: "flagged" } }),
      prisma.contribution.count(),
      prisma.contributorIdentity.count(),
    ]);

  return NextResponse.json(
    {
      total_constituencies: total,
      verified,
      pending,
      unverified,
      flagged,
      total_contributions: totalContributions,
      total_contributors: totalContributors,
      verification_percentage:
        total > 0 ? parseFloat(((verified / total) * 100).toFixed(2)) : 0,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
      },
    }
  );
}
