import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { isValidFingerprint } from "@/lib/validation/fingerprint";
import { checkDuplicate, hashIP } from "@/lib/validation/rate-limit";
import { checkVerificationThreshold } from "@/lib/clustering/spatial";
import { generateDisplayName } from "@/lib/identity/generator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contributionId } = await params;

  let body: { device_fingerprint: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { device_fingerprint } = body;

  if (!device_fingerprint || !isValidFingerprint(device_fingerprint)) {
    return NextResponse.json({ error: "Invalid device fingerprint" }, { status: 400 });
  }

  // Find the original contribution
  const original = await prisma.contribution.findUnique({
    where: { id: contributionId },
    select: { id: true, constituencyId: true, clusterId: true, lat: true, lng: true },
  });

  if (!original) {
    return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
  }

  // Check duplicate
  const isDuplicate = await checkDuplicate(device_fingerprint, original.constituencyId);
  if (isDuplicate) {
    return NextResponse.json(
      { error: "You have already contributed to this constituency." },
      { status: 409 }
    );
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
    const displayName = await generateDisplayName();
    const newIdentity = await prisma.contributorIdentity.create({
      data: {
        deviceFingerprint: device_fingerprint,
        displayName,
        identityType: "anonymous",
      },
      select: { id: true },
    });
    contributorId = newIdentity.id;
  }

  // Hash IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const salt = process.env.RATE_LIMIT_SALT || "default-salt";
  const ipHash = hashIP(ip, salt);

  // Insert confirmation contribution
  await prisma.contribution.create({
    data: {
      constituencyId: original.constituencyId,
      contributorId,
      lat: original.lat,
      lng: original.lng,
      clusterId: original.clusterId,
      deviceFingerprint: device_fingerprint,
      ipHash,
      isConfirmation: true,
    },
  });

  // Check verification threshold
  const result = await checkVerificationThreshold(
    original.clusterId!,
    original.constituencyId
  );

  const clusterCount = result?.count || 1;
  const remaining = Math.max(0, 7 - clusterCount);

  return NextResponse.json({
    cluster_count: clusterCount,
    message:
      remaining === 0
        ? "Location verified! Thank you."
        : `Confirmation recorded. ${remaining} more needed for verification.`,
  });
}
