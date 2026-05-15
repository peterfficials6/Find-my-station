# findmystation

Crowdsourced GPS mapping of Kenya's 290 IEBC voter registration offices. Citizens drop pins, 7 confirmations verify a location, and anyone can get directions.

## The Problem

IEBC publishes voter registration office locations as text-based landmark descriptions — *"Behind Equity Bank, 200 metres"* — in a static PDF. No GPS coordinates. No map. No way to tap a button and get directions.

## What This Does

- **Search** any of the 290 constituencies or browse by county
- **Drop a GPS pin** if you know where an IEBC office is
- **Verify** locations through community consensus (7 independent pins within 100m)
- **Navigate** to verified offices via Google Maps, Waze, Uber, or Apple Maps

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma + libSQL |
| Maps | Leaflet + OpenStreetMap (CARTO tiles) |
| Styling | Tailwind CSS |
| Navigation | Deep links (Google Maps, Waze, Uber, Apple Maps) |

## Project Structure

```
niko-kadi/
├── app/                    # Next.js pages and API routes
│   ├── api/                # REST API (constituencies, contribute, flag, stats)
│   ├── admin/              # Admin dashboard (auth-protected)
│   ├── station/[slug]/     # Individual station pages
│   └── county/[slug]/      # County listing pages
├── components/
│   ├── layout/             # PageShell, BottomNav
│   ├── map/                # FullScreenMap, MapView
│   ├── ui/                 # BottomSheet, StationCard, modals
│   └── admin/              # Dashboard components
├── lib/
│   ├── prisma/             # Database client
│   ├── clustering/         # Spatial verification (100m radius, 7-threshold)
│   ├── identity/           # Anonymous name generator
│   ├── validation/         # Rate limiting, geo-bounds, fingerprint
│   └── navigation/         # Deep link generation
└── prisma/
    ├── schema.prisma       # Database schema
    ├── seed.ts             # 47 counties + 290 constituencies
    └── migrations/         # SQLite migrations
```

## Getting Started

```bash
cd niko-kadi
npm install
npx prisma generate
npx prisma migrate dev --url "file:./prisma/dev.db"
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `niko-kadi/.env.local`:

```
DATABASE_URL="file:prisma/dev.db"
RATE_LIMIT_SALT="any-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_SESSION_SECRET="any-secret-for-jwt"
```

## How Verification Works

1. A user searches for a constituency and taps "Drop a Pin" on the map
2. They place the pin where the IEBC office is located
3. The system checks: rate limit (3/day), duplicate (1 per device per constituency), geo-bounds (within Kenya)
4. The pin is assigned to a cluster if one exists within 100m, or a new cluster is created
5. When 7 independent devices confirm the same cluster, the constituency is marked **verified** with the centroid as the official GPS point
6. Verified stations show navigation buttons to Google Maps, Waze, Uber, and Apple Maps

## Admin Dashboard

Accessible at `/admin` (default credentials: `admin` / `admin123`).

- **Overview** — verified/pending/unverified counts, contribution trends
- **Stats** — county-by-county breakdown with progress bars
- **Live** — active user sessions with world map
- **Data** — searchable/sortable constituency table
- **Flags** — user-reported incorrect locations
- **Suggestions** — feature requests from users

## Data

All 47 Kenyan counties and 290 constituencies are pre-seeded with names, slugs, office locations, and landmarks from IEBC published data. GPS coordinates start empty and are populated through crowdsourced contributions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing code, design, data, or translations.

## License

MIT
