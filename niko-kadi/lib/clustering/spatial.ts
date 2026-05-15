import { prisma } from "@/lib/prisma/client";

export const CLUSTER_RADIUS_METERS = 100;
export const VERIFICATION_THRESHOLD = 7;

/**
 * Find an existing cluster within 100 meters of the given coordinates.
 */
export async function findNearbyCluster(
  constituencyId: string,
  lat: number,
  lng: number
): Promise<{ cluster_id: string; count: number } | null> {
  const contributions = await prisma.contribution.findMany({
    where: {
      constituencyId,
      clusterId: { not: null },
    },
    select: { clusterId: true, lat: true, lng: true },
  });

  if (contributions.length === 0) return null;

  // Group by cluster
  const clusters = new Map<string, Array<{ lat: number; lng: number }>>();
  for (const c of contributions) {
    if (!c.clusterId) continue;
    if (!clusters.has(c.clusterId)) clusters.set(c.clusterId, []);
    clusters.get(c.clusterId)!.push({ lat: c.lat, lng: c.lng });
  }

  // Find a cluster whose centroid is within radius
  for (const [clusterId, pins] of clusters) {
    const centroidLat = pins.reduce((s, p) => s + p.lat, 0) / pins.length;
    const centroidLng = pins.reduce((s, p) => s + p.lng, 0) / pins.length;
    const dist = haversineDistance(lat, lng, centroidLat, centroidLng);
    if (dist <= CLUSTER_RADIUS_METERS) {
      return { cluster_id: clusterId, count: pins.length };
    }
  }

  return null;
}

/**
 * Check if a cluster has reached the verification threshold.
 * If >= 7 unique contributors, calculate centroid and verify.
 */
export async function checkVerificationThreshold(
  clusterId: string,
  constituencyId: string
): Promise<{ count: number; verified: boolean } | null> {
  const contributions = await prisma.contribution.findMany({
    where: { clusterId, constituencyId },
    select: { lat: true, lng: true, deviceFingerprint: true },
  });

  if (contributions.length === 0) return null;

  // Count unique devices
  const uniqueDevices = new Set(contributions.map((c: { deviceFingerprint: string }) => c.deviceFingerprint));
  const count = uniqueDevices.size;

  if (count >= VERIFICATION_THRESHOLD) {
    const centroidLat =
      contributions.reduce((sum: number, c: { lat: number }) => sum + c.lat, 0) / contributions.length;
    const centroidLng =
      contributions.reduce((sum: number, c: { lng: number }) => sum + c.lng, 0) / contributions.length;

    await prisma.constituency.update({
      where: { id: constituencyId },
      data: {
        verificationStatus: "verified",
        verifiedLat: centroidLat,
        verifiedLng: centroidLng,
        confirmationCount: count,
        verifiedAt: new Date(),
      },
    });

    return { count, verified: true };
  }

  // Update confirmation count
  await prisma.constituency.update({
    where: { id: constituencyId },
    data: {
      confirmationCount: count,
      verificationStatus: count > 0 ? "pending" : "unverified",
    },
  });

  return { count, verified: false };
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
