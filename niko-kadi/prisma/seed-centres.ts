/**
 * Seed script for Ruiru Constituency registration centres (pilot data).
 * 8 wards, 44 centres from IEBC 2026 ECVR data.
 *
 * Usage: npx tsx prisma/seed-centres.ts
 */
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Ruiru constituency wards and centres from IEBC 2026 ECVR data
const CONSTITUENCY_SLUG = "ruiru";
const CYCLE_YEAR = 2026;
const ACTIVE_FROM = new Date("2026-03-30");
const ACTIVE_UNTIL = new Date("2026-04-28");

const wardsData = [
  {
    code: 569,
    name: "Gitothua",
    centres: [
      "Tatu Primary School",
      "BTL AP Post",
      "Ngewe Primary School",
      "Gitothua Primary School",
      "Membley Police Post",
    ],
  },
  {
    code: 570,
    name: "Biashara",
    centres: [
      "Kihunguro AP Post",
      "Matopeni Primary School",
      "Githunguri Ranch Primary School",
      "Ruiru Secondary School",
      "St. Georges Primary School",
      "Ruiru Kenya Railways Hall",
      "Ruiru CDF Hall",
      "Kihunguro Bible Baptist Church",
      "Wataalam Police Post",
      "Devki Ruiru Township Secondary School",
    ],
  },
  {
    code: 571,
    name: "Gatongora",
    centres: [
      "Gikumari Primary School",
      "Kwihota Primary School",
      "Gatongora Primary School",
      "Kiratina Primary School",
      "ACK Canon Hesborn Church",
      "Mwalimu Farm Primary School",
      "Mutonya Dispensary",
      "Kwihota Senior Secondary School",
      "Mutonya Primary School",
    ],
  },
  {
    code: 572,
    name: "Kahawa Sukari",
    centres: [
      "ACK Kahawa Sukari",
      "Ndiini Primary School",
      "Engen Shopping Centre Kahawa Sukari",
    ],
  },
  {
    code: 573,
    name: "Kahawa Wendani",
    centres: [
      "Kahawa Wendani Primary School",
      "Kahawa Sukari Chiefs Camp",
      "Kahawa Wendani Social Hall",
    ],
  },
  {
    code: 574,
    name: "Kiuu",
    centres: [
      "Githurai Kimbo Primary School",
      "Kwangethe Primary School",
      "Githurai Mixed Secondary School",
      "Manguo Primary School",
    ],
  },
  {
    code: 575,
    name: "Mwiki",
    centres: [
      "Mwiki Assistant Chief Camp",
      "St. Augustine Catholic Church",
      "Mwiki Primary School",
      "Githurai Market",
    ],
  },
  {
    code: 576,
    name: "Mwihoko",
    centres: [
      "Mwihoko Primary School",
      "Mutuya Primary School",
      "Mwihoko Secondary School",
      "Mwitirithia Model ECDE Centre",
      "Finance Model ECDE Centre",
      "New Kahawa Sukari Estate",
    ],
  },
];

async function main() {
  // Find Ruiru constituency
  const constituency = await prisma.constituency.findUnique({
    where: { slug: CONSTITUENCY_SLUG },
  });

  if (!constituency) {
    console.error(`Constituency "${CONSTITUENCY_SLUG}" not found. Run the main seed first.`);
    process.exit(1);
  }

  console.log(`Seeding centres for ${constituency.name} (${constituency.id})`);

  let wardCount = 0;
  let centreCount = 0;

  for (const wardData of wardsData) {
    const wardSlug = slugify(`${CONSTITUENCY_SLUG}-${wardData.name}`);

    const ward = await prisma.ward.upsert({
      where: { slug: wardSlug },
      update: { name: wardData.name, code: wardData.code },
      create: {
        name: wardData.name,
        slug: wardSlug,
        code: wardData.code,
        constituencyId: constituency.id,
      },
    });
    wardCount++;
    console.log(`  Ward: ${ward.name} (${wardData.centres.length} centres)`);

    for (let i = 0; i < wardData.centres.length; i++) {
      const centreName = wardData.centres[i];
      const centreSlug = slugify(`${CONSTITUENCY_SLUG}-${wardData.name}-${centreName}`);
      const centreCode = i + 1;

      await prisma.registrationCentre.upsert({
        where: { slug: centreSlug },
        update: {
          name: centreName,
          code: centreCode,
          cycleYear: CYCLE_YEAR,
          activeFrom: ACTIVE_FROM,
          activeUntil: ACTIVE_UNTIL,
        },
        create: {
          name: centreName,
          slug: centreSlug,
          code: centreCode,
          wardId: ward.id,
          constituencyId: constituency.id,
          cycleYear: CYCLE_YEAR,
          activeFrom: ACTIVE_FROM,
          activeUntil: ACTIVE_UNTIL,
        },
      });
      centreCount++;
    }
  }

  console.log(`\nDone: ${wardCount} wards, ${centreCount} centres seeded.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
