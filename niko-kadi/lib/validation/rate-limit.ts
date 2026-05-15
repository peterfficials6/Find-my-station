import { createHash } from "crypto";
import { prisma } from "@/lib/prisma/client";

const MAX_CONTRIBUTIONS_PER_DAY = 3;

/**
 * Hash an IP address with a salt using SHA-256.
 */
export function hashIP(ip: string, salt: string): string {
  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
}

/**
 * Check if a device has exceeded the daily contribution rate limit.
 */
export async function checkRateLimit(
  deviceFingerprint: string
): Promise<{ allowed: boolean; error?: string }> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const count = await prisma.contribution.count({
    where: {
      deviceFingerprint,
      createdAt: { gte: oneDayAgo },
    },
  });

  if (count >= MAX_CONTRIBUTIONS_PER_DAY) {
    return {
      allowed: false,
      error: "Rate limit exceeded. Maximum 3 contributions per device per day.",
    };
  }

  return { allowed: true };
}

/**
 * Check if a device has already contributed to a specific constituency.
 */
export async function checkDuplicate(
  deviceFingerprint: string,
  constituencyId: string
): Promise<boolean> {
  const count = await prisma.contribution.count({
    where: { deviceFingerprint, constituencyId },
  });

  return count > 0;
}
