import { prisma } from "@/lib/prisma/client";
import { adjectives } from "@/lib/identity/adjectives";
import { animals } from "@/lib/identity/animals";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildDisplayName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${capitalize(adjective)} ${capitalize(animal)}`;
}

/**
 * Generate a unique anonymous display name.
 * Pattern: [Positive Adjective] [East African Animal]
 */
export async function generateDisplayName(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const name = buildDisplayName();

    const existing = await prisma.contributorIdentity.findFirst({
      where: { displayName: name },
      select: { id: true },
    });

    if (!existing) return name;
  }

  // Fallback with random suffix
  return `${buildDisplayName()} ${Math.floor(Math.random() * 100)}`;
}
