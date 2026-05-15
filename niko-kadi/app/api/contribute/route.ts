import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { isWithinKenya } from "@/lib/validation/geo";
import { isValidFingerprint } from "@/lib/validation/fingerprint";
import { checkRateLimit, checkDuplicate, hashIP } from "@/lib/validation/rate-limit";
import { logApiCall } from "@/lib/admin/tracking";
import { findNearbyCluster, checkVerificationThreshold } from "@/lib/clustering/spatial";
import { generateDisplayName } from "@/lib/identity/generator";
import type { ContributeRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  const trackIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  logApiCall("/api/contribute", "POST", trackIp);

  let body: ContributeRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { constituency_id, lat, lng, display_name, identity_type, device_fingerprint } = body;

  if (!constituency_id || lat == null || lng == null || !device_fingerprint) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!isValidFingerprint(device_fingerprint)) {
    return NextResponse.json({ error: "Invalid device fingerprint" }, { status: 400 });
  }

  if (!isWithinKenya(lat, lng)) {
    return NextResponse.json(
      { error: "Invalid location. Coordinates must be within Kenya." },
      { status: 400 }
    );
  }

  // Rate limit check
  const rateCheck = await checkRateLimit(device_fingerprint);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: rateCheck.error }, { status: 429 });
  }

  // Duplicate check
  const isDuplicate = await checkDuplicate(device_fingerprint, constituency_id);
  if (isDuplicate) {
    return NextResponse.json(
      { error: "You have already contributed to this constituency." },
      { status: 409 }
    );
  }

  // Verify constituency exists
  const constituency = await prisma.constituency.findUnique({
    where: { id: constituency_id },
    select: { id: true },
  });

  if (!constituency) {
    return NextResponse.json({ error: "Constituency not found" }, { status: 404 });
  }

  // Get or create contributor identity
  let contributorId: string;
  const existingIdentity = await prisma.contributorIdentity.findUnique({
    where: { deviceFingerprint: device_fingerprint },
    select: { id: true },
  });

  if (existingIdentity) {
    contributorId = existingIdentity.id;
  } else {
    const finalDisplayName =
      identity_type === "anonymous"
        ? await generateDisplayName()
        : display_name || "Anonymous";

    const newIdentity = await prisma.contributorIdentity.create({
      data: {
        deviceFingerprint: device_fingerprint,
        displayName: finalDisplayName,
        identityType: identity_type || "anonymous",
      },
      select: { id: true },
    });

    contributorId = newIdentity.id;
  }

  // Cluster assignment
  const cluster = await findNearbyCluster(constituency_id, lat, lng);
  const clusterId = cluster?.cluster_id || crypto.randomUUID();
  const isConfirmation = !!cluster;

  // Hash IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const salt = process.env.RATE_LIMIT_SALT || "default-salt";
  const ipHash = hashIP(ip, salt);

  // Insert contribution
  const contribution = await prisma.contribution.create({
    data: {
      constituencyId: constituency_id,
      contributorId,
      lat,
      lng,
      clusterId,
      deviceFingerprint: device_fingerprint,
      ipHash,
      isConfirmation,
    },
    select: { id: true, clusterId: true },
  });

  // Update contributor count
  await prisma.contributorIdentity.update({
    where: { id: contributorId },
    data: { contributionCount: { increment: 1 } },
  });

  // Check verification threshold
  const verificationResult = await checkVerificationThreshold(clusterId, constituency_id);

  const clusterCount = verificationResult?.count || 1;
  const remaining = Math.max(0, 7 - clusterCount);

  return NextResponse.json(
    {
      id: contribution.id,
      cluster_id: contribution.clusterId,
      cluster_count: clusterCount,
      message:
        remaining === 0
          ? "Location verified! Thank you for your contribution."
          : `Contribution recorded. ${remaining} more confirmation${remaining === 1 ? "" : "s"} needed for verification.`,
    },
    { status: 201 }
  );
}
