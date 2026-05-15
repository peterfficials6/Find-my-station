import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

function createClient() {
  const dbUrl = process.env.DATABASE_URL || `file:${path.join(__dirname, "dev.db")}`;

  if (dbUrl.startsWith("file:")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const adapter = new PrismaLibSql({ url: dbUrl });
    return new PrismaClient({ adapter } as never);
  }

  // PostgreSQL — individual connection vars
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as never);
}

const prisma = createClient();

// ---------------------------------------------------------------------------
// County data – all 47 Kenyan counties
// ---------------------------------------------------------------------------
const counties = [
  { name: "Mombasa", slug: "mombasa", constituencyCount: 6 },
  { name: "Kwale", slug: "kwale", constituencyCount: 4 },
  { name: "Kilifi", slug: "kilifi", constituencyCount: 7 },
  { name: "Tana River", slug: "tana-river", constituencyCount: 3 },
  { name: "Lamu", slug: "lamu", constituencyCount: 2 },
  { name: "Taita Taveta", slug: "taita-taveta", constituencyCount: 4 },
  { name: "Garissa", slug: "garissa", constituencyCount: 6 },
  { name: "Wajir", slug: "wajir", constituencyCount: 6 },
  { name: "Mandera", slug: "mandera", constituencyCount: 6 },
  { name: "Marsabit", slug: "marsabit", constituencyCount: 4 },
  { name: "Isiolo", slug: "isiolo", constituencyCount: 2 },
  { name: "Meru", slug: "meru", constituencyCount: 9 },
  { name: "Tharaka Nithi", slug: "tharaka-nithi", constituencyCount: 3 },
  { name: "Embu", slug: "embu", constituencyCount: 4 },
  { name: "Kitui", slug: "kitui", constituencyCount: 8 },
  { name: "Machakos", slug: "machakos", constituencyCount: 8 },
  { name: "Makueni", slug: "makueni", constituencyCount: 6 },
  { name: "Nyandarua", slug: "nyandarua", constituencyCount: 5 },
  { name: "Nyeri", slug: "nyeri", constituencyCount: 6 },
  { name: "Kirinyaga", slug: "kirinyaga", constituencyCount: 4 },
  { name: "Murang'a", slug: "muranga", constituencyCount: 7 },
  { name: "Kiambu", slug: "kiambu", constituencyCount: 12 },
  { name: "Turkana", slug: "turkana", constituencyCount: 6 },
  { name: "West Pokot", slug: "west-pokot", constituencyCount: 4 },
  { name: "Samburu", slug: "samburu", constituencyCount: 3 },
  { name: "Trans Nzoia", slug: "trans-nzoia", constituencyCount: 5 },
  { name: "Uasin Gishu", slug: "uasin-gishu", constituencyCount: 6 },
  { name: "Elgeyo Marakwet", slug: "elgeyo-marakwet", constituencyCount: 4 },
  { name: "Nandi", slug: "nandi", constituencyCount: 6 },
  { name: "Baringo", slug: "baringo", constituencyCount: 6 },
  { name: "Laikipia", slug: "laikipia", constituencyCount: 3 },
  { name: "Nakuru", slug: "nakuru", constituencyCount: 11 },
  { name: "Narok", slug: "narok", constituencyCount: 6 },
  { name: "Kajiado", slug: "kajiado", constituencyCount: 5 },
  { name: "Kericho", slug: "kericho", constituencyCount: 6 },
  { name: "Bomet", slug: "bomet", constituencyCount: 5 },
  { name: "Kakamega", slug: "kakamega", constituencyCount: 12 },
  { name: "Vihiga", slug: "vihiga", constituencyCount: 5 },
  { name: "Bungoma", slug: "bungoma", constituencyCount: 9 },
  { name: "Busia", slug: "busia", constituencyCount: 7 },
  { name: "Siaya", slug: "siaya", constituencyCount: 6 },
  { name: "Kisumu", slug: "kisumu", constituencyCount: 7 },
  { name: "Homa Bay", slug: "homa-bay", constituencyCount: 8 },
  { name: "Migori", slug: "migori", constituencyCount: 8 },
  { name: "Kisii", slug: "kisii", constituencyCount: 9 },
  { name: "Nyamira", slug: "nyamira", constituencyCount: 4 },
  { name: "Nairobi", slug: "nairobi", constituencyCount: 17 },
];

// ---------------------------------------------------------------------------
// Constituency data – grouped by county slug
// ---------------------------------------------------------------------------
interface ConstituencyData {
  name: string;
  slug: string;
  officeLocation: string | null;
  landmark: string | null;
  distanceToOffice: string | null;
}

const constituencies: Record<string, ConstituencyData[]> = {
  mombasa: [
    { name: "Changamwe", slug: "changamwe", officeLocation: "Changamwe Social Hall", landmark: "Near Changamwe roundabout", distanceToOffice: "0.5 km from Changamwe stage" },
    { name: "Jomvu", slug: "jomvu", officeLocation: "Jomvu DO's Office", landmark: "Along Mombasa-Nairobi Highway", distanceToOffice: "1 km from Mikindani" },
    { name: "Kisauni", slug: "kisauni", officeLocation: "Kisauni DO's Office", landmark: "Near Kisauni Police Station", distanceToOffice: "0.3 km from Kisauni stage" },
    { name: "Nyali", slug: "nyali", officeLocation: "Nyali CDF Office", landmark: "Near Nyali Bridge", distanceToOffice: "2 km from Nyali Centre" },
    { name: "Likoni", slug: "likoni", officeLocation: "Likoni DO's Office", landmark: "Near Likoni Ferry", distanceToOffice: "0.5 km from Likoni Ferry" },
    { name: "Mvita", slug: "mvita", officeLocation: "Mvita Constituency Office", landmark: "Near Fort Jesus", distanceToOffice: "1 km from Mombasa CBD" },
  ],
  kwale: [
    { name: "Msambweni", slug: "msambweni", officeLocation: "Msambweni Sub-County Office", landmark: "Near Msambweni Hospital", distanceToOffice: "0.5 km from Msambweni town" },
    { name: "Lunga Lunga", slug: "lunga-lunga", officeLocation: "Lunga Lunga DO's Office", landmark: "Near Kenya-Tanzania border", distanceToOffice: "1 km from Lunga Lunga town" },
    { name: "Matuga", slug: "matuga", officeLocation: "Kwale Town Hall", landmark: "Near Kwale town centre", distanceToOffice: "0.3 km from Kwale town" },
    { name: "Kinango", slug: "kinango", officeLocation: "Kinango DO's Office", landmark: "Near Kinango Market", distanceToOffice: "0.5 km from Kinango centre" },
  ],
  kilifi: [
    { name: "Kilifi North", slug: "kilifi-north", officeLocation: "Kilifi North Sub-County Office", landmark: "Near Kilifi Bridge", distanceToOffice: "1 km from Kilifi town" },
    { name: "Kilifi South", slug: "kilifi-south", officeLocation: "Kilifi South CDF Office", landmark: "Near Mtwapa Creek", distanceToOffice: "0.5 km from Mtwapa" },
    { name: "Kaloleni", slug: "kaloleni", officeLocation: "Kaloleni DO's Office", landmark: "Near Kaloleni Market", distanceToOffice: "0.3 km from Kaloleni centre" },
    { name: "Rabai", slug: "rabai", officeLocation: "Rabai DO's Office", landmark: "Near Rabai Museum", distanceToOffice: "0.5 km from Rabai town" },
    { name: "Ganze", slug: "ganze", officeLocation: "Ganze DO's Office", landmark: "Near Ganze Market", distanceToOffice: "0.3 km from Ganze centre" },
    { name: "Malindi", slug: "malindi", officeLocation: "Malindi Sub-County Office", landmark: "Near Malindi town centre", distanceToOffice: "0.5 km from Malindi CBD" },
    { name: "Magarini", slug: "magarini", officeLocation: "Magarini DO's Office", landmark: "Near Marafa town", distanceToOffice: "1 km from Marafa" },
  ],
  "tana-river": [
    { name: "Garsen", slug: "garsen", officeLocation: "Garsen DO's Office", landmark: "Near Garsen Bridge", distanceToOffice: "0.5 km from Garsen town" },
    { name: "Galole", slug: "galole", officeLocation: "Hola Town Hall", landmark: "Near Hola town centre", distanceToOffice: "0.3 km from Hola town" },
    { name: "Bura", slug: "bura-tana-river", officeLocation: "Bura DO's Office", landmark: "Near Bura Irrigation Scheme", distanceToOffice: "1 km from Bura town" },
  ],
  lamu: [
    { name: "Lamu East", slug: "lamu-east", officeLocation: "Lamu East DO's Office", landmark: "Near Lamu Old Town", distanceToOffice: "0.5 km from Lamu jetty" },
    { name: "Lamu West", slug: "lamu-west", officeLocation: "Lamu West Sub-County Office", landmark: "Near Mokowe junction", distanceToOffice: "1 km from Mokowe" },
  ],
  "taita-taveta": [
    { name: "Taveta", slug: "taveta", officeLocation: "Taveta DO's Office", landmark: "Near Taveta town centre", distanceToOffice: "0.3 km from Taveta town" },
    { name: "Wundanyi", slug: "wundanyi", officeLocation: "Wundanyi DO's Office", landmark: "Near Wundanyi town centre", distanceToOffice: "0.5 km from Wundanyi" },
    { name: "Mwatate", slug: "mwatate", officeLocation: "Mwatate DO's Office", landmark: "Near Mwatate Market", distanceToOffice: "0.3 km from Mwatate town" },
    { name: "Voi", slug: "voi", officeLocation: "Voi Sub-County Office", landmark: "Near Voi town centre", distanceToOffice: "0.5 km from Voi CBD" },
  ],
  garissa: [
    { name: "Garissa Township", slug: "garissa-township", officeLocation: "Garissa County Hall", landmark: "Near Garissa town centre", distanceToOffice: "0.3 km from Garissa CBD" },
    { name: "Balambala", slug: "balambala", officeLocation: "Balambala DO's Office", landmark: "Near Balambala Market", distanceToOffice: "0.5 km from Balambala town" },
    { name: "Lagdera", slug: "lagdera", officeLocation: "Modogashe DO's Office", landmark: "Near Modogashe town", distanceToOffice: "0.5 km from Modogashe" },
    { name: "Dadaab", slug: "dadaab", officeLocation: "Dadaab DO's Office", landmark: "Near Dadaab town centre", distanceToOffice: "1 km from Dadaab centre" },
    { name: "Fafi", slug: "fafi", officeLocation: "Bura DO's Office", landmark: "Near Bura town", distanceToOffice: "0.5 km from Bura" },
    { name: "Ijara", slug: "ijara", officeLocation: "Ijara DO's Office", landmark: "Near Ijara town", distanceToOffice: "0.5 km from Ijara" },
  ],
  wajir: [
    { name: "Wajir North", slug: "wajir-north", officeLocation: "Bute DO's Office", landmark: "Near Bute town", distanceToOffice: "0.5 km from Bute" },
    { name: "Wajir East", slug: "wajir-east", officeLocation: "Wajir County Hall", landmark: "Near Wajir town centre", distanceToOffice: "0.3 km from Wajir CBD" },
    { name: "Wajir South", slug: "wajir-south", officeLocation: "Habaswein DO's Office", landmark: "Near Habaswein town", distanceToOffice: "0.5 km from Habaswein" },
    { name: "Wajir West", slug: "wajir-west", officeLocation: "Griftu DO's Office", landmark: "Near Griftu town", distanceToOffice: "0.5 km from Griftu" },
    { name: "Eldas", slug: "eldas", officeLocation: "Eldas DO's Office", landmark: "Near Eldas town", distanceToOffice: "0.5 km from Eldas" },
    { name: "Tarbaj", slug: "tarbaj", officeLocation: "Tarbaj DO's Office", landmark: "Near Tarbaj town", distanceToOffice: "0.5 km from Tarbaj" },
  ],
  mandera: [
    { name: "Mandera West", slug: "mandera-west", officeLocation: "Takaba DO's Office", landmark: "Near Takaba town", distanceToOffice: "0.5 km from Takaba" },
    { name: "Banissa", slug: "banissa", officeLocation: "Banissa DO's Office", landmark: "Near Banissa town", distanceToOffice: "0.5 km from Banissa" },
    { name: "Mandera North", slug: "mandera-north", officeLocation: "Rhamu DO's Office", landmark: "Near Rhamu town", distanceToOffice: "0.5 km from Rhamu" },
    { name: "Mandera South", slug: "mandera-south", officeLocation: "Elwak DO's Office", landmark: "Near Elwak town", distanceToOffice: "0.5 km from Elwak" },
    { name: "Mandera East", slug: "mandera-east", officeLocation: "Mandera County Hall", landmark: "Near Mandera town centre", distanceToOffice: "0.3 km from Mandera CBD" },
    { name: "Lafey", slug: "lafey", officeLocation: "Lafey DO's Office", landmark: "Near Lafey town", distanceToOffice: "0.5 km from Lafey" },
  ],
  marsabit: [
    { name: "Moyale", slug: "moyale", officeLocation: "Moyale DO's Office", landmark: "Near Kenya-Ethiopia border", distanceToOffice: "0.5 km from Moyale town" },
    { name: "North Horr", slug: "north-horr", officeLocation: "North Horr DO's Office", landmark: "Near North Horr town", distanceToOffice: "0.5 km from North Horr" },
    { name: "Saku", slug: "saku", officeLocation: "Marsabit Town Hall", landmark: "Near Marsabit town centre", distanceToOffice: "0.3 km from Marsabit CBD" },
    { name: "Laisamis", slug: "laisamis", officeLocation: "Laisamis DO's Office", landmark: "Near Laisamis town", distanceToOffice: "0.5 km from Laisamis" },
  ],
  isiolo: [
    { name: "Isiolo North", slug: "isiolo-north", officeLocation: "Merti DO's Office", landmark: "Near Merti town", distanceToOffice: "0.5 km from Merti" },
    { name: "Isiolo South", slug: "isiolo-south", officeLocation: "Isiolo Town Hall", landmark: "Near Isiolo town centre", distanceToOffice: "0.3 km from Isiolo CBD" },
  ],
  meru: [
    { name: "Igembe South", slug: "igembe-south", officeLocation: "Igembe South DO's Office", landmark: "Near Kangeta town", distanceToOffice: "0.5 km from Kangeta" },
    { name: "Igembe Central", slug: "igembe-central", officeLocation: "Igembe Central DO's Office", landmark: "Near Athiru Gaiti", distanceToOffice: "0.5 km from Athiru Gaiti" },
    { name: "Igembe North", slug: "igembe-north", officeLocation: "Igembe North DO's Office", landmark: "Near Mutuati town", distanceToOffice: "0.5 km from Mutuati" },
    { name: "Tigania West", slug: "tigania-west", officeLocation: "Tigania West DO's Office", landmark: "Near Kianjai town", distanceToOffice: "0.5 km from Kianjai" },
    { name: "Tigania East", slug: "tigania-east", officeLocation: "Tigania East DO's Office", landmark: "Near Mikinduri town", distanceToOffice: "0.5 km from Mikinduri" },
    { name: "North Imenti", slug: "north-imenti", officeLocation: "North Imenti DO's Office", landmark: "Near Meru town", distanceToOffice: "1 km from Meru CBD" },
    { name: "Buuri", slug: "buuri", officeLocation: "Buuri DO's Office", landmark: "Near Timau town", distanceToOffice: "0.5 km from Timau" },
    { name: "Central Imenti", slug: "central-imenti", officeLocation: "Meru Town Hall", landmark: "Near Meru town centre", distanceToOffice: "0.3 km from Meru CBD" },
    { name: "South Imenti", slug: "south-imenti", officeLocation: "South Imenti DO's Office", landmark: "Near Nkubu town", distanceToOffice: "0.5 km from Nkubu" },
  ],
  "tharaka-nithi": [
    { name: "Maara", slug: "maara", officeLocation: "Chogoria DO's Office", landmark: "Near Chogoria town", distanceToOffice: "0.5 km from Chogoria" },
    { name: "Chuka/Igambang'ombe", slug: "chuka-igambangombe", officeLocation: "Chuka Town Hall", landmark: "Near Chuka town centre", distanceToOffice: "0.3 km from Chuka" },
    { name: "Tharaka", slug: "tharaka", officeLocation: "Tharaka DO's Office", landmark: "Near Marimanti town", distanceToOffice: "0.5 km from Marimanti" },
  ],
  embu: [
    { name: "Manyatta", slug: "manyatta", officeLocation: "Embu Town Hall", landmark: "Near Embu town centre", distanceToOffice: "0.3 km from Embu CBD" },
    { name: "Runyenjes", slug: "runyenjes", officeLocation: "Runyenjes DO's Office", landmark: "Near Runyenjes town", distanceToOffice: "0.5 km from Runyenjes" },
    { name: "Mbeere South", slug: "mbeere-south", officeLocation: "Kiritiri DO's Office", landmark: "Near Kiritiri town", distanceToOffice: "0.5 km from Kiritiri" },
    { name: "Mbeere North", slug: "mbeere-north", officeLocation: "Siakago DO's Office", landmark: "Near Siakago town", distanceToOffice: "0.5 km from Siakago" },
  ],
  kitui: [
    { name: "Mwingi North", slug: "mwingi-north", officeLocation: "Mwingi North DO's Office", landmark: "Near Kyuso town", distanceToOffice: "0.5 km from Kyuso" },
    { name: "Mwingi West", slug: "mwingi-west", officeLocation: "Mwingi West DO's Office", landmark: "Near Migwani town", distanceToOffice: "0.5 km from Migwani" },
    { name: "Mwingi Central", slug: "mwingi-central", officeLocation: "Mwingi Town Hall", landmark: "Near Mwingi town centre", distanceToOffice: "0.3 km from Mwingi" },
    { name: "Kitui West", slug: "kitui-west", officeLocation: "Kitui West DO's Office", landmark: "Near Kabati town", distanceToOffice: "0.5 km from Kabati" },
    { name: "Kitui Rural", slug: "kitui-rural", officeLocation: "Kitui Rural DO's Office", landmark: "Near Kitui town", distanceToOffice: "2 km from Kitui CBD" },
    { name: "Kitui Central", slug: "kitui-central", officeLocation: "Kitui Town Hall", landmark: "Near Kitui town centre", distanceToOffice: "0.3 km from Kitui CBD" },
    { name: "Kitui East", slug: "kitui-east", officeLocation: "Kitui East DO's Office", landmark: "Near Zombe town", distanceToOffice: "0.5 km from Zombe" },
    { name: "Kitui South", slug: "kitui-south", officeLocation: "Kitui South DO's Office", landmark: "Near Mutomo town", distanceToOffice: "0.5 km from Mutomo" },
  ],
  machakos: [
    { name: "Masinga", slug: "masinga", officeLocation: "Masinga DO's Office", landmark: "Near Masinga Dam", distanceToOffice: "1 km from Masinga town" },
    { name: "Yatta", slug: "yatta", officeLocation: "Yatta DO's Office", landmark: "Near Matuu town", distanceToOffice: "0.5 km from Matuu" },
    { name: "Kangundo", slug: "kangundo", officeLocation: "Kangundo DO's Office", landmark: "Near Kangundo town", distanceToOffice: "0.5 km from Kangundo" },
    { name: "Matungulu", slug: "matungulu", officeLocation: "Matungulu DO's Office", landmark: "Near Tala town", distanceToOffice: "0.5 km from Tala" },
    { name: "Kathiani", slug: "kathiani", officeLocation: "Kathiani DO's Office", landmark: "Near Kathiani town", distanceToOffice: "0.5 km from Kathiani" },
    { name: "Mavoko", slug: "mavoko", officeLocation: "Athi River DO's Office", landmark: "Near Athi River town", distanceToOffice: "0.5 km from Athi River" },
    { name: "Machakos Town", slug: "machakos-town", officeLocation: "Machakos Town Hall", landmark: "Near Machakos town centre", distanceToOffice: "0.3 km from Machakos CBD" },
    { name: "Mwala", slug: "mwala", officeLocation: "Mwala DO's Office", landmark: "Near Mwala town", distanceToOffice: "0.5 km from Mwala" },
  ],
  makueni: [
    { name: "Mbooni", slug: "mbooni", officeLocation: "Mbooni DO's Office", landmark: "Near Mbooni town", distanceToOffice: "0.5 km from Mbooni" },
    { name: "Kilome", slug: "kilome", officeLocation: "Kilome DO's Office", landmark: "Near Kasikeu town", distanceToOffice: "0.5 km from Kasikeu" },
    { name: "Kaiti", slug: "kaiti", officeLocation: "Kaiti DO's Office", landmark: "Near Kilungu town", distanceToOffice: "0.5 km from Kilungu" },
    { name: "Makueni", slug: "makueni", officeLocation: "Wote Town Hall", landmark: "Near Wote town centre", distanceToOffice: "0.3 km from Wote" },
    { name: "Kibwezi West", slug: "kibwezi-west", officeLocation: "Makindu DO's Office", landmark: "Near Makindu town", distanceToOffice: "0.5 km from Makindu" },
    { name: "Kibwezi East", slug: "kibwezi-east", officeLocation: "Mtito Andei DO's Office", landmark: "Near Mtito Andei town", distanceToOffice: "0.5 km from Mtito Andei" },
  ],
  nyandarua: [
    { name: "Kinangop", slug: "kinangop", officeLocation: "Kinangop DO's Office", landmark: "Near Engineer town", distanceToOffice: "0.5 km from Engineer" },
    { name: "Kipipiri", slug: "kipipiri", officeLocation: "Kipipiri DO's Office", landmark: "Near Kipipiri town", distanceToOffice: "0.5 km from Kipipiri" },
    { name: "Ol Kalou", slug: "ol-kalou", officeLocation: "Ol Kalou Town Hall", landmark: "Near Ol Kalou town centre", distanceToOffice: "0.3 km from Ol Kalou" },
    { name: "Ol Jorok", slug: "ol-jorok", officeLocation: "Ol Jorok DO's Office", landmark: "Near Ol Jorok town", distanceToOffice: "0.5 km from Ol Jorok" },
    { name: "Ndaragwa", slug: "ndaragwa", officeLocation: "Ndaragwa DO's Office", landmark: "Near Ndaragwa town", distanceToOffice: "0.5 km from Ndaragwa" },
  ],
  nyeri: [
    { name: "Tetu", slug: "tetu", officeLocation: "Tetu DO's Office", landmark: "Near Tetu town", distanceToOffice: "0.5 km from Tetu" },
    { name: "Kieni", slug: "kieni", officeLocation: "Kieni DO's Office", landmark: "Near Narumoru town", distanceToOffice: "0.5 km from Narumoru" },
    { name: "Mathira", slug: "mathira", officeLocation: "Mathira DO's Office", landmark: "Near Karatina town", distanceToOffice: "0.5 km from Karatina" },
    { name: "Othaya", slug: "othaya", officeLocation: "Othaya DO's Office", landmark: "Near Othaya town", distanceToOffice: "0.5 km from Othaya" },
    { name: "Mukurweini", slug: "mukurweini", officeLocation: "Mukurweini DO's Office", landmark: "Near Mukurweini town", distanceToOffice: "0.5 km from Mukurweini" },
    { name: "Nyeri Town", slug: "nyeri-town", officeLocation: "Nyeri Town Hall", landmark: "Near Nyeri town centre", distanceToOffice: "0.3 km from Nyeri CBD" },
  ],
  kirinyaga: [
    { name: "Mwea", slug: "mwea", officeLocation: "Mwea DO's Office", landmark: "Near Wang'uru town", distanceToOffice: "0.5 km from Wang'uru" },
    { name: "Gichugu", slug: "gichugu", officeLocation: "Gichugu DO's Office", landmark: "Near Kianyaga town", distanceToOffice: "0.5 km from Kianyaga" },
    { name: "Ndia", slug: "ndia", officeLocation: "Ndia DO's Office", landmark: "Near Kerugoya town", distanceToOffice: "0.5 km from Kerugoya" },
    { name: "Kirinyaga Central", slug: "kirinyaga-central", officeLocation: "Kerugoya Town Hall", landmark: "Near Kerugoya town centre", distanceToOffice: "0.3 km from Kerugoya" },
  ],
  muranga: [
    { name: "Kangema", slug: "kangema", officeLocation: "Kangema DO's Office", landmark: "Near Kangema town", distanceToOffice: "0.5 km from Kangema" },
    { name: "Mathioya", slug: "mathioya", officeLocation: "Mathioya DO's Office", landmark: "Near Mathioya town", distanceToOffice: "0.5 km from Mathioya" },
    { name: "Kiharu", slug: "kiharu", officeLocation: "Murang'a Town Hall", landmark: "Near Murang'a town centre", distanceToOffice: "0.3 km from Murang'a CBD" },
    { name: "Kigumo", slug: "kigumo", officeLocation: "Kigumo DO's Office", landmark: "Near Kigumo town", distanceToOffice: "0.5 km from Kigumo" },
    { name: "Maragwa", slug: "maragwa", officeLocation: "Maragwa DO's Office", landmark: "Near Maragwa town", distanceToOffice: "0.5 km from Maragwa" },
    { name: "Kandara", slug: "kandara", officeLocation: "Kandara DO's Office", landmark: "Near Kandara town", distanceToOffice: "0.5 km from Kandara" },
    { name: "Gatanga", slug: "gatanga", officeLocation: "Gatanga DO's Office", landmark: "Near Gatanga town", distanceToOffice: "0.5 km from Gatanga" },
  ],
  kiambu: [
    { name: "Gatundu South", slug: "gatundu-south", officeLocation: "Gatundu South DO's Office", landmark: "Near Gatundu town", distanceToOffice: "0.5 km from Gatundu" },
    { name: "Gatundu North", slug: "gatundu-north", officeLocation: "Gatundu North DO's Office", landmark: "Near Gatundu North", distanceToOffice: "1 km from Gatundu" },
    { name: "Juja", slug: "juja", officeLocation: "Juja DO's Office", landmark: "Near Juja town", distanceToOffice: "0.5 km from Juja" },
    { name: "Thika Town", slug: "thika-town", officeLocation: "Thika Town Hall", landmark: "Near Thika town centre", distanceToOffice: "0.3 km from Thika CBD" },
    { name: "Ruiru", slug: "ruiru", officeLocation: "Ruiru DO's Office", landmark: "Near Ruiru town", distanceToOffice: "0.5 km from Ruiru" },
    { name: "Githunguri", slug: "githunguri", officeLocation: "Githunguri DO's Office", landmark: "Near Githunguri town", distanceToOffice: "0.5 km from Githunguri" },
    { name: "Kiambu", slug: "kiambu-town", officeLocation: "Kiambu Town Hall", landmark: "Near Kiambu town centre", distanceToOffice: "0.3 km from Kiambu CBD" },
    { name: "Kiambaa", slug: "kiambaa", officeLocation: "Kiambaa DO's Office", landmark: "Near Karuri town", distanceToOffice: "0.5 km from Karuri" },
    { name: "Kabete", slug: "kabete", officeLocation: "Kabete DO's Office", landmark: "Near Kabete town", distanceToOffice: "0.5 km from Kabete" },
    { name: "Kikuyu", slug: "kikuyu", officeLocation: "Kikuyu DO's Office", landmark: "Near Kikuyu town", distanceToOffice: "0.5 km from Kikuyu" },
    { name: "Limuru", slug: "limuru", officeLocation: "Limuru DO's Office", landmark: "Near Limuru town", distanceToOffice: "0.5 km from Limuru" },
    { name: "Lari", slug: "lari", officeLocation: "Lari DO's Office", landmark: "Near Lari town", distanceToOffice: "0.5 km from Lari" },
  ],
  turkana: [
    { name: "Turkana North", slug: "turkana-north", officeLocation: "Turkana North DO's Office", landmark: "Near Lokitaung town", distanceToOffice: "0.5 km from Lokitaung" },
    { name: "Turkana West", slug: "turkana-west", officeLocation: "Turkana West DO's Office", landmark: "Near Kakuma town", distanceToOffice: "0.5 km from Kakuma" },
    { name: "Turkana Central", slug: "turkana-central", officeLocation: "Lodwar Town Hall", landmark: "Near Lodwar town centre", distanceToOffice: "0.3 km from Lodwar" },
    { name: "Loima", slug: "loima", officeLocation: "Loima DO's Office", landmark: "Near Loima town", distanceToOffice: "0.5 km from Loima" },
    { name: "Turkana South", slug: "turkana-south", officeLocation: "Turkana South DO's Office", landmark: "Near Lokichar town", distanceToOffice: "0.5 km from Lokichar" },
    { name: "Turkana East", slug: "turkana-east", officeLocation: "Turkana East DO's Office", landmark: "Near Kapedo town", distanceToOffice: "0.5 km from Kapedo" },
  ],
  "west-pokot": [
    { name: "Kapenguria", slug: "kapenguria", officeLocation: "Kapenguria Town Hall", landmark: "Near Kapenguria town centre", distanceToOffice: "0.3 km from Kapenguria" },
    { name: "Sigor", slug: "sigor", officeLocation: "Sigor DO's Office", landmark: "Near Sigor town", distanceToOffice: "0.5 km from Sigor" },
    { name: "Kacheliba", slug: "kacheliba", officeLocation: "Kacheliba DO's Office", landmark: "Near Kacheliba town", distanceToOffice: "0.5 km from Kacheliba" },
    { name: "Pokot South", slug: "pokot-south", officeLocation: "Pokot South DO's Office", landmark: "Near Chepareria town", distanceToOffice: "0.5 km from Chepareria" },
  ],
  samburu: [
    { name: "Samburu West", slug: "samburu-west", officeLocation: "Maralal Town Hall", landmark: "Near Maralal town centre", distanceToOffice: "0.3 km from Maralal" },
    { name: "Samburu North", slug: "samburu-north", officeLocation: "Samburu North DO's Office", landmark: "Near Baragoi town", distanceToOffice: "0.5 km from Baragoi" },
    { name: "Samburu East", slug: "samburu-east", officeLocation: "Samburu East DO's Office", landmark: "Near Wamba town", distanceToOffice: "0.5 km from Wamba" },
  ],
  "trans-nzoia": [
    { name: "Kwanza", slug: "kwanza", officeLocation: "Kwanza DO's Office", landmark: "Near Kwanza town", distanceToOffice: "0.5 km from Kwanza" },
    { name: "Endebess", slug: "endebess", officeLocation: "Endebess DO's Office", landmark: "Near Endebess town", distanceToOffice: "0.5 km from Endebess" },
    { name: "Saboti", slug: "saboti", officeLocation: "Saboti DO's Office", landmark: "Near Saboti town", distanceToOffice: "0.5 km from Saboti" },
    { name: "Kiminini", slug: "kiminini", officeLocation: "Kiminini DO's Office", landmark: "Near Kiminini town", distanceToOffice: "0.5 km from Kiminini" },
    { name: "Cherangany", slug: "cherangany", officeLocation: "Cherangany DO's Office", landmark: "Near Cherangany town", distanceToOffice: "0.5 km from Cherangany" },
  ],
  "uasin-gishu": [
    { name: "Soy", slug: "soy", officeLocation: "Soy DO's Office", landmark: "Near Soy town", distanceToOffice: "0.5 km from Soy" },
    { name: "Turbo", slug: "turbo", officeLocation: "Turbo DO's Office", landmark: "Near Turbo town", distanceToOffice: "0.5 km from Turbo" },
    { name: "Moiben", slug: "moiben", officeLocation: "Moiben DO's Office", landmark: "Near Moiben town", distanceToOffice: "0.5 km from Moiben" },
    { name: "Ainabkoi", slug: "ainabkoi", officeLocation: "Ainabkoi DO's Office", landmark: "Near Ainabkoi town", distanceToOffice: "0.5 km from Ainabkoi" },
    { name: "Kapseret", slug: "kapseret", officeLocation: "Kapseret DO's Office", landmark: "Near Kapseret town", distanceToOffice: "0.5 km from Kapseret" },
    { name: "Kesses", slug: "kesses", officeLocation: "Kesses DO's Office", landmark: "Near Kesses town", distanceToOffice: "0.5 km from Kesses" },
  ],
  "elgeyo-marakwet": [
    { name: "Marakwet East", slug: "marakwet-east", officeLocation: "Marakwet East DO's Office", landmark: "Near Iten town", distanceToOffice: "1 km from Iten" },
    { name: "Marakwet West", slug: "marakwet-west", officeLocation: "Marakwet West DO's Office", landmark: "Near Kapsowar town", distanceToOffice: "0.5 km from Kapsowar" },
    { name: "Keiyo North", slug: "keiyo-north", officeLocation: "Keiyo North DO's Office", landmark: "Near Iten town", distanceToOffice: "0.5 km from Iten" },
    { name: "Keiyo South", slug: "keiyo-south", officeLocation: "Keiyo South DO's Office", landmark: "Near Chepkorio town", distanceToOffice: "0.5 km from Chepkorio" },
  ],
  nandi: [
    { name: "Tinderet", slug: "tinderet", officeLocation: "Tinderet DO's Office", landmark: "Near Tinderet town", distanceToOffice: "0.5 km from Tinderet" },
    { name: "Aldai", slug: "aldai", officeLocation: "Aldai DO's Office", landmark: "Near Kobujoi town", distanceToOffice: "0.5 km from Kobujoi" },
    { name: "Nandi Hills", slug: "nandi-hills", officeLocation: "Nandi Hills DO's Office", landmark: "Near Nandi Hills town", distanceToOffice: "0.5 km from Nandi Hills" },
    { name: "Chesumei", slug: "chesumei", officeLocation: "Chesumei DO's Office", landmark: "Near Kapsabet town", distanceToOffice: "1 km from Kapsabet" },
    { name: "Emgwen", slug: "emgwen", officeLocation: "Emgwen DO's Office", landmark: "Near Kapsabet town", distanceToOffice: "0.5 km from Kapsabet" },
    { name: "Mosop", slug: "mosop", officeLocation: "Mosop DO's Office", landmark: "Near Kabiyet town", distanceToOffice: "0.5 km from Kabiyet" },
  ],
  baringo: [
    { name: "Tiaty", slug: "tiaty", officeLocation: "Tiaty DO's Office", landmark: "Near Nginyang town", distanceToOffice: "0.5 km from Nginyang" },
    { name: "Baringo North", slug: "baringo-north", officeLocation: "Baringo North DO's Office", landmark: "Near Kabartonjo town", distanceToOffice: "0.5 km from Kabartonjo" },
    { name: "Baringo Central", slug: "baringo-central", officeLocation: "Kabarnet Town Hall", landmark: "Near Kabarnet town centre", distanceToOffice: "0.3 km from Kabarnet" },
    { name: "Baringo South", slug: "baringo-south", officeLocation: "Baringo South DO's Office", landmark: "Near Marigat town", distanceToOffice: "0.5 km from Marigat" },
    { name: "Mogotio", slug: "mogotio", officeLocation: "Mogotio DO's Office", landmark: "Near Mogotio town", distanceToOffice: "0.5 km from Mogotio" },
    { name: "Eldama Ravine", slug: "eldama-ravine", officeLocation: "Eldama Ravine DO's Office", landmark: "Near Eldama Ravine town", distanceToOffice: "0.5 km from Eldama Ravine" },
  ],
  laikipia: [
    { name: "Laikipia West", slug: "laikipia-west", officeLocation: "Laikipia West DO's Office", landmark: "Near Rumuruti town", distanceToOffice: "0.5 km from Rumuruti" },
    { name: "Laikipia East", slug: "laikipia-east", officeLocation: "Nanyuki Town Hall", landmark: "Near Nanyuki town centre", distanceToOffice: "0.3 km from Nanyuki" },
    { name: "Laikipia North", slug: "laikipia-north", officeLocation: "Laikipia North DO's Office", landmark: "Near Dol Dol town", distanceToOffice: "0.5 km from Dol Dol" },
  ],
  nakuru: [
    { name: "Molo", slug: "molo", officeLocation: "Molo DO's Office", landmark: "Near Molo town", distanceToOffice: "0.5 km from Molo" },
    { name: "Njoro", slug: "njoro", officeLocation: "Njoro DO's Office", landmark: "Near Njoro town", distanceToOffice: "0.5 km from Njoro" },
    { name: "Naivasha", slug: "naivasha", officeLocation: "Naivasha DO's Office", landmark: "Near Naivasha town centre", distanceToOffice: "0.5 km from Naivasha" },
    { name: "Gilgil", slug: "gilgil", officeLocation: "Gilgil DO's Office", landmark: "Near Gilgil town", distanceToOffice: "0.5 km from Gilgil" },
    { name: "Kuresoi South", slug: "kuresoi-south", officeLocation: "Kuresoi South DO's Office", landmark: "Near Kuresoi town", distanceToOffice: "0.5 km from Kuresoi" },
    { name: "Kuresoi North", slug: "kuresoi-north", officeLocation: "Kuresoi North DO's Office", landmark: "Near Elburgon town", distanceToOffice: "0.5 km from Elburgon" },
    { name: "Subukia", slug: "subukia", officeLocation: "Subukia DO's Office", landmark: "Near Subukia town", distanceToOffice: "0.5 km from Subukia" },
    { name: "Rongai", slug: "rongai", officeLocation: "Rongai DO's Office", landmark: "Near Rongai town", distanceToOffice: "0.5 km from Rongai" },
    { name: "Bahati", slug: "bahati", officeLocation: "Bahati DO's Office", landmark: "Near Bahati town", distanceToOffice: "0.5 km from Bahati" },
    { name: "Nakuru Town East", slug: "nakuru-town-east", officeLocation: "Nakuru Town Hall", landmark: "Near Nakuru town centre", distanceToOffice: "0.3 km from Nakuru CBD" },
    { name: "Nakuru Town West", slug: "nakuru-town-west", officeLocation: "Nakuru West DO's Office", landmark: "Near Nakuru town", distanceToOffice: "1 km from Nakuru CBD" },
  ],
  narok: [
    { name: "Kilgoris", slug: "kilgoris", officeLocation: "Kilgoris DO's Office", landmark: "Near Kilgoris town", distanceToOffice: "0.5 km from Kilgoris" },
    { name: "Emurua Dikirr", slug: "emurua-dikirr", officeLocation: "Emurua Dikirr DO's Office", landmark: "Near Emurua Dikirr town", distanceToOffice: "0.5 km from Emurua Dikirr" },
    { name: "Narok North", slug: "narok-north", officeLocation: "Narok Town Hall", landmark: "Near Narok town centre", distanceToOffice: "0.3 km from Narok CBD" },
    { name: "Narok East", slug: "narok-east", officeLocation: "Narok East DO's Office", landmark: "Near Narok town", distanceToOffice: "1 km from Narok" },
    { name: "Narok South", slug: "narok-south", officeLocation: "Narok South DO's Office", landmark: "Near Ololulung'a town", distanceToOffice: "0.5 km from Ololulung'a" },
    { name: "Narok West", slug: "narok-west", officeLocation: "Narok West DO's Office", landmark: "Near Narok town", distanceToOffice: "2 km from Narok CBD" },
  ],
  kajiado: [
    { name: "Kajiado North", slug: "kajiado-north", officeLocation: "Kajiado North DO's Office", landmark: "Near Ngong town", distanceToOffice: "0.5 km from Ngong" },
    { name: "Kajiado Central", slug: "kajiado-central", officeLocation: "Kajiado Town Hall", landmark: "Near Kajiado town centre", distanceToOffice: "0.3 km from Kajiado" },
    { name: "Kajiado East", slug: "kajiado-east", officeLocation: "Kajiado East DO's Office", landmark: "Near Kitengela town", distanceToOffice: "0.5 km from Kitengela" },
    { name: "Kajiado West", slug: "kajiado-west", officeLocation: "Kajiado West DO's Office", landmark: "Near Ewaso Kedong", distanceToOffice: "0.5 km from Ewaso Kedong" },
    { name: "Kajiado South", slug: "kajiado-south", officeLocation: "Kajiado South DO's Office", landmark: "Near Loitokitok town", distanceToOffice: "0.5 km from Loitokitok" },
  ],
  kericho: [
    { name: "Kipkelion East", slug: "kipkelion-east", officeLocation: "Kipkelion East DO's Office", landmark: "Near Kipkelion town", distanceToOffice: "0.5 km from Kipkelion" },
    { name: "Kipkelion West", slug: "kipkelion-west", officeLocation: "Kipkelion West DO's Office", landmark: "Near Londiani town", distanceToOffice: "0.5 km from Londiani" },
    { name: "Ainamoi", slug: "ainamoi", officeLocation: "Kericho Town Hall", landmark: "Near Kericho town centre", distanceToOffice: "0.3 km from Kericho CBD" },
    { name: "Bureti", slug: "bureti", officeLocation: "Bureti DO's Office", landmark: "Near Litein town", distanceToOffice: "0.5 km from Litein" },
    { name: "Belgut", slug: "belgut", officeLocation: "Belgut DO's Office", landmark: "Near Belgut town", distanceToOffice: "0.5 km from Belgut" },
    { name: "Sigowet/Soin", slug: "sigowet-soin", officeLocation: "Sigowet DO's Office", landmark: "Near Sigowet town", distanceToOffice: "0.5 km from Sigowet" },
  ],
  bomet: [
    { name: "Sotik", slug: "sotik", officeLocation: "Sotik DO's Office", landmark: "Near Sotik town", distanceToOffice: "0.5 km from Sotik" },
    { name: "Chepalungu", slug: "chepalungu", officeLocation: "Chepalungu DO's Office", landmark: "Near Sigor town", distanceToOffice: "0.5 km from Sigor" },
    { name: "Bomet East", slug: "bomet-east", officeLocation: "Bomet East DO's Office", landmark: "Near Bomet town", distanceToOffice: "1 km from Bomet" },
    { name: "Bomet Central", slug: "bomet-central", officeLocation: "Bomet Town Hall", landmark: "Near Bomet town centre", distanceToOffice: "0.3 km from Bomet CBD" },
    { name: "Konoin", slug: "konoin", officeLocation: "Konoin DO's Office", landmark: "Near Konoin town", distanceToOffice: "0.5 km from Konoin" },
  ],
  kakamega: [
    { name: "Lugari", slug: "lugari", officeLocation: "Lugari DO's Office", landmark: "Near Lumakanda town", distanceToOffice: "0.5 km from Lumakanda" },
    { name: "Likuyani", slug: "likuyani", officeLocation: "Likuyani DO's Office", landmark: "Near Likuyani town", distanceToOffice: "0.5 km from Likuyani" },
    { name: "Malava", slug: "malava", officeLocation: "Malava DO's Office", landmark: "Near Malava town", distanceToOffice: "0.5 km from Malava" },
    { name: "Lurambi", slug: "lurambi", officeLocation: "Kakamega Town Hall", landmark: "Near Kakamega town centre", distanceToOffice: "0.3 km from Kakamega CBD" },
    { name: "Navakholo", slug: "navakholo", officeLocation: "Navakholo DO's Office", landmark: "Near Navakholo town", distanceToOffice: "0.5 km from Navakholo" },
    { name: "Mumias West", slug: "mumias-west", officeLocation: "Mumias West DO's Office", landmark: "Near Mumias town", distanceToOffice: "1 km from Mumias" },
    { name: "Mumias East", slug: "mumias-east", officeLocation: "Mumias East DO's Office", landmark: "Near Mumias town", distanceToOffice: "0.5 km from Mumias" },
    { name: "Matungu", slug: "matungu", officeLocation: "Matungu DO's Office", landmark: "Near Matungu town", distanceToOffice: "0.5 km from Matungu" },
    { name: "Butere", slug: "butere", officeLocation: "Butere DO's Office", landmark: "Near Butere town", distanceToOffice: "0.5 km from Butere" },
    { name: "Khwisero", slug: "khwisero", officeLocation: "Khwisero DO's Office", landmark: "Near Khwisero town", distanceToOffice: "0.5 km from Khwisero" },
    { name: "Shinyalu", slug: "shinyalu", officeLocation: "Shinyalu DO's Office", landmark: "Near Shinyalu town", distanceToOffice: "0.5 km from Shinyalu" },
    { name: "Ikolomani", slug: "ikolomani", officeLocation: "Ikolomani DO's Office", landmark: "Near Ikolomani town", distanceToOffice: "0.5 km from Ikolomani" },
  ],
  vihiga: [
    { name: "Vihiga", slug: "vihiga", officeLocation: "Vihiga DO's Office", landmark: "Near Vihiga town", distanceToOffice: "0.5 km from Vihiga" },
    { name: "Sabatia", slug: "sabatia", officeLocation: "Sabatia DO's Office", landmark: "Near Sabatia town", distanceToOffice: "0.5 km from Sabatia" },
    { name: "Hamisi", slug: "hamisi", officeLocation: "Hamisi DO's Office", landmark: "Near Hamisi town", distanceToOffice: "0.5 km from Hamisi" },
    { name: "Luanda", slug: "luanda", officeLocation: "Luanda DO's Office", landmark: "Near Luanda town", distanceToOffice: "0.5 km from Luanda" },
    { name: "Emuhaya", slug: "emuhaya", officeLocation: "Emuhaya DO's Office", landmark: "Near Emuhaya town", distanceToOffice: "0.5 km from Emuhaya" },
  ],
  bungoma: [
    { name: "Mount Elgon", slug: "mount-elgon", officeLocation: "Mount Elgon DO's Office", landmark: "Near Kapsokwony town", distanceToOffice: "0.5 km from Kapsokwony" },
    { name: "Sirisia", slug: "sirisia", officeLocation: "Sirisia DO's Office", landmark: "Near Sirisia town", distanceToOffice: "0.5 km from Sirisia" },
    { name: "Kabuchai", slug: "kabuchai", officeLocation: "Kabuchai DO's Office", landmark: "Near Chwele town", distanceToOffice: "0.5 km from Chwele" },
    { name: "Bumula", slug: "bumula", officeLocation: "Bumula DO's Office", landmark: "Near Bumula town", distanceToOffice: "0.5 km from Bumula" },
    { name: "Kanduyi", slug: "kanduyi", officeLocation: "Bungoma Town Hall", landmark: "Near Bungoma town centre", distanceToOffice: "0.3 km from Bungoma CBD" },
    { name: "Webuye East", slug: "webuye-east", officeLocation: "Webuye East DO's Office", landmark: "Near Webuye town", distanceToOffice: "0.5 km from Webuye" },
    { name: "Webuye West", slug: "webuye-west", officeLocation: "Webuye West DO's Office", landmark: "Near Webuye town", distanceToOffice: "1 km from Webuye" },
    { name: "Kimilili", slug: "kimilili", officeLocation: "Kimilili DO's Office", landmark: "Near Kimilili town", distanceToOffice: "0.5 km from Kimilili" },
    { name: "Tongaren", slug: "tongaren", officeLocation: "Tongaren DO's Office", landmark: "Near Tongaren town", distanceToOffice: "0.5 km from Tongaren" },
  ],
  busia: [
    { name: "Teso North", slug: "teso-north", officeLocation: "Teso North DO's Office", landmark: "Near Amagoro town", distanceToOffice: "0.5 km from Amagoro" },
    { name: "Teso South", slug: "teso-south", officeLocation: "Teso South DO's Office", landmark: "Near Amukura town", distanceToOffice: "0.5 km from Amukura" },
    { name: "Nambale", slug: "nambale", officeLocation: "Nambale DO's Office", landmark: "Near Nambale town", distanceToOffice: "0.5 km from Nambale" },
    { name: "Matayos", slug: "matayos", officeLocation: "Matayos DO's Office", landmark: "Near Matayos town", distanceToOffice: "0.5 km from Matayos" },
    { name: "Butula", slug: "butula", officeLocation: "Butula DO's Office", landmark: "Near Butula town", distanceToOffice: "0.5 km from Butula" },
    { name: "Funyula", slug: "funyula", officeLocation: "Funyula DO's Office", landmark: "Near Funyula town", distanceToOffice: "0.5 km from Funyula" },
    { name: "Budalangi", slug: "budalangi", officeLocation: "Budalangi DO's Office", landmark: "Near Budalangi town", distanceToOffice: "0.5 km from Budalangi" },
  ],
  siaya: [
    { name: "Ugenya", slug: "ugenya", officeLocation: "Ugenya DO's Office", landmark: "Near Ukwala town", distanceToOffice: "0.5 km from Ukwala" },
    { name: "Ugunja", slug: "ugunja", officeLocation: "Ugunja DO's Office", landmark: "Near Ugunja town", distanceToOffice: "0.5 km from Ugunja" },
    { name: "Alego Usonga", slug: "alego-usonga", officeLocation: "Siaya Town Hall", landmark: "Near Siaya town centre", distanceToOffice: "0.3 km from Siaya CBD" },
    { name: "Gem", slug: "gem", officeLocation: "Gem DO's Office", landmark: "Near Yala town", distanceToOffice: "0.5 km from Yala" },
    { name: "Bondo", slug: "bondo", officeLocation: "Bondo DO's Office", landmark: "Near Bondo town", distanceToOffice: "0.5 km from Bondo" },
    { name: "Rarieda", slug: "rarieda", officeLocation: "Rarieda DO's Office", landmark: "Near Rarieda town", distanceToOffice: "0.5 km from Rarieda" },
  ],
  kisumu: [
    { name: "Kisumu East", slug: "kisumu-east", officeLocation: "Kisumu East DO's Office", landmark: "Near Kisumu town", distanceToOffice: "1 km from Kisumu CBD" },
    { name: "Kisumu West", slug: "kisumu-west", officeLocation: "Kisumu West DO's Office", landmark: "Near Maseno town", distanceToOffice: "0.5 km from Maseno" },
    { name: "Kisumu Central", slug: "kisumu-central", officeLocation: "Kisumu City Hall", landmark: "Near Kisumu town centre", distanceToOffice: "0.3 km from Kisumu CBD" },
    { name: "Seme", slug: "seme", officeLocation: "Seme DO's Office", landmark: "Near Kombewa town", distanceToOffice: "0.5 km from Kombewa" },
    { name: "Nyando", slug: "nyando", officeLocation: "Nyando DO's Office", landmark: "Near Ahero town", distanceToOffice: "0.5 km from Ahero" },
    { name: "Muhoroni", slug: "muhoroni", officeLocation: "Muhoroni DO's Office", landmark: "Near Muhoroni town", distanceToOffice: "0.5 km from Muhoroni" },
    { name: "Nyakach", slug: "nyakach", officeLocation: "Nyakach DO's Office", landmark: "Near Nyakach town", distanceToOffice: "0.5 km from Nyakach" },
  ],
  "homa-bay": [
    { name: "Kasipul", slug: "kasipul", officeLocation: "Kasipul DO's Office", landmark: "Near Oyugis town", distanceToOffice: "0.5 km from Oyugis" },
    { name: "Kabondo Kasipul", slug: "kabondo-kasipul", officeLocation: "Kabondo DO's Office", landmark: "Near Kabondo town", distanceToOffice: "0.5 km from Kabondo" },
    { name: "Karachuonyo", slug: "karachuonyo", officeLocation: "Karachuonyo DO's Office", landmark: "Near Kendu Bay", distanceToOffice: "0.5 km from Kendu Bay" },
    { name: "Rangwe", slug: "rangwe", officeLocation: "Rangwe DO's Office", landmark: "Near Rangwe town", distanceToOffice: "0.5 km from Rangwe" },
    { name: "Homa Bay Town", slug: "homa-bay-town", officeLocation: "Homa Bay Town Hall", landmark: "Near Homa Bay town centre", distanceToOffice: "0.3 km from Homa Bay CBD" },
    { name: "Ndhiwa", slug: "ndhiwa", officeLocation: "Ndhiwa DO's Office", landmark: "Near Ndhiwa town", distanceToOffice: "0.5 km from Ndhiwa" },
    { name: "Suba North", slug: "suba-north", officeLocation: "Suba North DO's Office", landmark: "Near Mbita town", distanceToOffice: "0.5 km from Mbita" },
    { name: "Suba South", slug: "suba-south", officeLocation: "Suba South DO's Office", landmark: "Near Magunga town", distanceToOffice: "0.5 km from Magunga" },
  ],
  migori: [
    { name: "Rongo", slug: "rongo", officeLocation: "Rongo DO's Office", landmark: "Near Rongo town", distanceToOffice: "0.5 km from Rongo" },
    { name: "Awendo", slug: "awendo", officeLocation: "Awendo DO's Office", landmark: "Near Awendo town", distanceToOffice: "0.5 km from Awendo" },
    { name: "Suna East", slug: "suna-east", officeLocation: "Migori Town Hall", landmark: "Near Migori town centre", distanceToOffice: "0.3 km from Migori CBD" },
    { name: "Suna West", slug: "suna-west", officeLocation: "Suna West DO's Office", landmark: "Near Migori town", distanceToOffice: "1 km from Migori" },
    { name: "Uriri", slug: "uriri", officeLocation: "Uriri DO's Office", landmark: "Near Uriri town", distanceToOffice: "0.5 km from Uriri" },
    { name: "Nyatike", slug: "nyatike", officeLocation: "Nyatike DO's Office", landmark: "Near Macalder town", distanceToOffice: "0.5 km from Macalder" },
    { name: "Kuria West", slug: "kuria-west", officeLocation: "Kuria West DO's Office", landmark: "Near Kehancha town", distanceToOffice: "0.5 km from Kehancha" },
    { name: "Kuria East", slug: "kuria-east", officeLocation: "Kuria East DO's Office", landmark: "Near Kegonga town", distanceToOffice: "0.5 km from Kegonga" },
  ],
  kisii: [
    { name: "Bonchari", slug: "bonchari", officeLocation: "Bonchari DO's Office", landmark: "Near Suneka town", distanceToOffice: "0.5 km from Suneka" },
    { name: "South Mugirango", slug: "south-mugirango", officeLocation: "South Mugirango DO's Office", landmark: "Near Etago town", distanceToOffice: "0.5 km from Etago" },
    { name: "Bomachoge Borabu", slug: "bomachoge-borabu", officeLocation: "Bomachoge Borabu DO's Office", landmark: "Near Ogembo town", distanceToOffice: "0.5 km from Ogembo" },
    { name: "Bobasi", slug: "bobasi", officeLocation: "Bobasi DO's Office", landmark: "Near Nyamarambe town", distanceToOffice: "0.5 km from Nyamarambe" },
    { name: "Bomachoge Chache", slug: "bomachoge-chache", officeLocation: "Bomachoge Chache DO's Office", landmark: "Near Ogembo town", distanceToOffice: "1 km from Ogembo" },
    { name: "Nyaribari Masaba", slug: "nyaribari-masaba", officeLocation: "Nyaribari Masaba DO's Office", landmark: "Near Keroka town", distanceToOffice: "0.5 km from Keroka" },
    { name: "Nyaribari Chache", slug: "nyaribari-chache", officeLocation: "Kisii Town Hall", landmark: "Near Kisii town centre", distanceToOffice: "0.3 km from Kisii CBD" },
    { name: "Kitutu Chache North", slug: "kitutu-chache-north", officeLocation: "Kitutu Chache North DO's Office", landmark: "Near Kisii town", distanceToOffice: "1 km from Kisii" },
    { name: "Kitutu Chache South", slug: "kitutu-chache-south", officeLocation: "Kitutu Chache South DO's Office", landmark: "Near Kisii town", distanceToOffice: "2 km from Kisii" },
  ],
  nyamira: [
    { name: "Kitutu Masaba", slug: "kitutu-masaba", officeLocation: "Kitutu Masaba DO's Office", landmark: "Near Masimba town", distanceToOffice: "0.5 km from Masimba" },
    { name: "West Mugirango", slug: "west-mugirango", officeLocation: "West Mugirango DO's Office", landmark: "Near Nyamira town", distanceToOffice: "1 km from Nyamira" },
    { name: "North Mugirango", slug: "north-mugirango", officeLocation: "North Mugirango DO's Office", landmark: "Near Manga town", distanceToOffice: "0.5 km from Manga" },
    { name: "Borabu", slug: "borabu", officeLocation: "Borabu DO's Office", landmark: "Near Nyansiongo town", distanceToOffice: "0.5 km from Nyansiongo" },
  ],
  nairobi: [
    { name: "Westlands", slug: "westlands", officeLocation: "Westlands DO's Office", landmark: "Near Westlands roundabout", distanceToOffice: "0.3 km from Westlands" },
    { name: "Dagoretti North", slug: "dagoretti-north", officeLocation: "Dagoretti North DO's Office", landmark: "Near Waithaka town", distanceToOffice: "0.5 km from Waithaka" },
    { name: "Dagoretti South", slug: "dagoretti-south", officeLocation: "Dagoretti South DO's Office", landmark: "Near Ngando town", distanceToOffice: "0.5 km from Ngando" },
    { name: "Langata", slug: "langata", officeLocation: "Langata DO's Office", landmark: "Near Langata Road", distanceToOffice: "1 km from Langata" },
    { name: "Kibra", slug: "kibra", officeLocation: "Kibra DO's Office", landmark: "Near Kibera", distanceToOffice: "0.5 km from Kibera" },
    { name: "Roysambu", slug: "roysambu", officeLocation: "Roysambu DO's Office", landmark: "Near Roysambu", distanceToOffice: "0.5 km from Roysambu" },
    { name: "Kasarani", slug: "kasarani", officeLocation: "Kasarani DO's Office", landmark: "Near Kasarani Stadium", distanceToOffice: "0.5 km from Kasarani" },
    { name: "Ruaraka", slug: "ruaraka", officeLocation: "Ruaraka DO's Office", landmark: "Near Babadogo", distanceToOffice: "0.5 km from Babadogo" },
    { name: "Embakasi South", slug: "embakasi-south", officeLocation: "Embakasi South DO's Office", landmark: "Near Pipeline", distanceToOffice: "0.5 km from Pipeline" },
    { name: "Embakasi North", slug: "embakasi-north", officeLocation: "Embakasi North DO's Office", landmark: "Near Dandora", distanceToOffice: "0.5 km from Dandora" },
    { name: "Embakasi Central", slug: "embakasi-central", officeLocation: "Embakasi Central DO's Office", landmark: "Near Kayole", distanceToOffice: "0.5 km from Kayole" },
    { name: "Embakasi East", slug: "embakasi-east", officeLocation: "Embakasi East DO's Office", landmark: "Near Utawala", distanceToOffice: "0.5 km from Utawala" },
    { name: "Embakasi West", slug: "embakasi-west", officeLocation: "Embakasi West DO's Office", landmark: "Near Umoja", distanceToOffice: "0.5 km from Umoja" },
    { name: "Makadara", slug: "makadara", officeLocation: "Makadara DO's Office", landmark: "Near Makadara", distanceToOffice: "0.5 km from Makadara" },
    { name: "Kamukunji", slug: "kamukunji", officeLocation: "Kamukunji DO's Office", landmark: "Near Eastleigh", distanceToOffice: "0.5 km from Eastleigh" },
    { name: "Starehe", slug: "starehe", officeLocation: "Starehe DO's Office", landmark: "Near Nairobi CBD", distanceToOffice: "0.3 km from Nairobi CBD" },
    { name: "Mathare", slug: "mathare", officeLocation: "Mathare DO's Office", landmark: "Near Mathare", distanceToOffice: "0.5 km from Mathare" },
  ],
};

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding database...\n");

  for (const county of counties) {
    const upsertedCounty = await prisma.county.upsert({
      where: { slug: county.slug },
      update: {
        name: county.name,
        constituencyCount: county.constituencyCount,
      },
      create: {
        name: county.name,
        slug: county.slug,
        constituencyCount: county.constituencyCount,
      },
    });

    console.log(`County: ${upsertedCounty.name} (${upsertedCounty.slug})`);

    const countyConstituencies = constituencies[county.slug] || [];

    for (const c of countyConstituencies) {
      const upsertedConstituency = await prisma.constituency.upsert({
        where: { slug: c.slug },
        update: {
          name: c.name,
          countyId: upsertedCounty.id,
          officeLocation: c.officeLocation,
          landmark: c.landmark,
          distanceToOffice: c.distanceToOffice,
        },
        create: {
          name: c.name,
          slug: c.slug,
          countyId: upsertedCounty.id,
          officeLocation: c.officeLocation,
          landmark: c.landmark,
          distanceToOffice: c.distanceToOffice,
        },
      });

      console.log(`  Constituency: ${upsertedConstituency.name}`);
    }
  }

  // Seed admin user
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: { passwordHash },
    create: { username: adminUsername, passwordHash },
  });
  console.log(`\nAdmin user: ${adminUsername} (password from ADMIN_PASSWORD env or default)`);

  console.log("\nSeeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
