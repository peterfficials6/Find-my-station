import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { isValidFingerprint } from "@/lib/validation/fingerprint";

const FLAG_THRESHOLD = 5;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: constituencyId } = await params;

  let body: { device_fingerprint: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { device_fingerprint, reason } = body;

  if (!device_fingerprint || !isValidFingerprint(device_fingerprint)) {
    return NextResponse.json({ error: "Invalid device fingerprint" }, { status: 400 });
  }

  // Verify constituency exists
  const constituency = await prisma.constituency.findUnique({
    where: { id: constituencyId },
    select: { id: true, verificationStatus: true },
  });

  if (!constituency) {
    return NextResponse.json({ error: "Constituency not found" }, { status: 404 });
  }

  // Check for duplicate flag
  const existingFlag = await prisma.flag.findUnique({
    where: {
      deviceFingerprint_constituencyId: {
        deviceFingerprint: device_fingerprint,
        constituencyId,
      },
    },
  });

  if (existingFlag) {
    return NextResponse.json(
      { error: "You have already flagged this constituency." },
      { status: 409 }
    );
  }

  // Insert flag
  await prisma.flag.create({
    data: {
      constituencyId,
      deviceFingerprint: device_fingerprint,
      reason: reason || null,
    },
  });

  // Count total flags
  const totalFlags = await prisma.flag.count({
    where: { constituencyId },
  });

  // If flags reach threshold, re-validate
  if (totalFlags >= FLAG_THRESHOLD) {
    await prisma.constituency.update({
      where: { id: constituencyId },
      data: {
        verificationStatus: "flagged",
        verifiedLat: null,
        verifiedLng: null,
        confirmationCount: 0,
        verifiedAt: null,
      },
    });

    // Delete contributions and flags for fresh start
    await prisma.contribution.deleteMany({ where: { constituencyId } });
    await prisma.flag.deleteMany({ where: { constituencyId } });
  }

  return NextResponse.json({
    flag_count: totalFlags,
    message:
      totalFlags >= FLAG_THRESHOLD
        ? "Location has been reset for re-verification due to community flags."
        : `Flag recorded. Location will be re-evaluated at ${FLAG_THRESHOLD} flags.`,
  });
}
