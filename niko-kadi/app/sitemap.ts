import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://findmystation.or.ke";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contribute`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const counties = await prisma.county.findMany({ select: { slug: true } });
    const countyPages: MetadataRoute.Sitemap = counties.map((c: { slug: string }) => ({
      url: `${baseUrl}/county/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const constituencies = await prisma.constituency.findMany({
      select: { slug: true, updatedAt: true },
    });
    const stationPages: MetadataRoute.Sitemap = constituencies.map((s: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/station/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...countyPages, ...stationPages];
  } catch {
    return staticPages;
  }
}
