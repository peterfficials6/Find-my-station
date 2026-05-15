# Contributing to findmystation

Thanks for your interest in contributing. This project is built to help Kenyan voters find their IEBC registration offices, and every contribution matters.

## Ways to Contribute

### Drop a GPS Pin

The simplest way to help — if you know where an IEBC office is, visit [the app](https://findmystation.co.ke), search for the constituency, and drop a pin on the map. No code required.

### Code

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make your changes in the `niko-kadi/` directory
4. Run `npx tsc --noEmit` to check for type errors
5. Run `npm run build` to verify the production build
6. Commit with a clear, short message
7. Open a pull request against `main`

#### Local Setup

```bash
cd niko-kadi
npm install
npx prisma generate
npx prisma migrate dev --url "file:./prisma/dev.db"
npx tsx prisma/seed.ts
npm run dev
```

#### Code Style

- TypeScript strict mode
- Tailwind CSS for styling (no CSS modules)
- Server components by default, `"use client"` only when needed
- Prisma for all database access
- No external UI libraries — components are built from scratch

#### Key Architecture Decisions

- **SQLite + Prisma** — zero-cost local database, no external dependencies
- **Leaflet + CARTO tiles** — free map rendering, no API keys
- **Device fingerprinting** — SHA-256 hash of browser properties for rate limiting, never stored in a way that identifies users
- **7-confirmation threshold** — a location needs 7 independent devices within 100m to become verified
- **Deep links for navigation** — we hand off to Google Maps, Waze, etc. instead of building routing

### Design

Design contributions are welcome — UI mockups, accessibility improvements, branding assets, or UX feedback. Upload files to Google Drive or similar and share the link via the "Suggest a Feature" form on the Help page.

Areas that could use design input:

- County-level map visualization
- Verification progress animations
- Onboarding flow for first-time contributors
- Print materials for community outreach
- Swahili / multilingual UI

### Data

- **Station verification** — physically visit IEBC offices and confirm GPS pins
- **Cross-referencing** — compare crowdsourced data against IEBC published station lists
- **Missing info** — some constituencies have incomplete office locations or landmarks in the seed data

### Translation

The app is currently English-only. Help translate to Swahili and other Kenyan languages. The key files with user-facing text:

- `app/about/page.tsx`
- `app/contribute/page.tsx`
- `components/ui/ContributionModal.tsx`
- `components/ui/BottomSheet.tsx`
- `components/layout/BottomNav.tsx`

## Project Structure

```
niko-kadi/
├── app/                    # Pages and API routes
│   ├── api/                # REST endpoints
│   │   ├── constituencies/ # Search and list
│   │   ├── contribute/     # Submit GPS pins
│   │   ├── station/        # Station details
│   │   ├── confirm/        # Confirm a station
│   │   ├── flag/           # Report incorrect data
│   │   ├── stats/          # Public stats
│   │   ├── suggestions/    # Feature suggestions
│   │   └── admin/          # Protected admin endpoints
│   ├── admin/              # Admin dashboard pages
│   ├── station/[slug]/     # Station detail page
│   ├── county/[slug]/      # County listing page
│   ├── about/              # About page
│   └── contribute/         # Help page
├── components/
│   ├── layout/             # PageShell, BottomNav
│   ├── map/                # FullScreenMap
│   ├── ui/                 # BottomSheet, StationCard, modals
│   └── admin/              # Admin dashboard components
├── lib/
│   ├── prisma/             # Database client singleton
│   ├── clustering/         # 100m radius clustering + 7-threshold verification
│   ├── identity/           # Anonymous name generator (adjective + animal)
│   ├── validation/         # Rate limiting, geo-bounds, fingerprint validation
│   ├── navigation/         # Deep link URLs for map apps
│   ├── admin/              # Auth, sessions, tracking
│   └── utils/              # Slugify, date formatting
├── hooks/                  # useFingerprint, useGeolocation
└── prisma/
    ├── schema.prisma       # 9 models
    ├── seed.ts             # 47 counties + 290 constituencies
    └── migrations/         # SQLite migrations
```

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/constituencies` | GET | Search/filter/paginate constituencies |
| `/api/station/[slug]` | GET | Station details with contributions and navigation links |
| `/api/contribute` | POST | Submit a GPS pin |
| `/api/confirm/[id]` | POST | Confirm an existing pin |
| `/api/flag/[id]` | POST | Flag an incorrect verified location |
| `/api/stats` | GET | Public verification stats |
| `/api/suggestions` | POST | Submit a feature suggestion |

## Database Models

| Model | Purpose |
|-------|---------|
| County | 47 Kenyan counties |
| Constituency | 290 IEBC offices with verification status |
| Contribution | GPS pins from contributors |
| ContributorIdentity | Anonymous/named/nicknamed identities |
| Flag | Reports of incorrect verified locations |
| AdminUser | Admin dashboard authentication |
| PageView | Page visit tracking |
| ApiCall | API usage tracking |
| SearchLog | Search query analytics |
| FeatureSuggestion | User-submitted feature ideas |

## Guidelines

- Only pin locations you have physically visited
- One contribution per device per constituency
- Maximum 3 contributions per day
- Use the flag button to report incorrect verified locations
- Be respectful in feature suggestions

## Questions?

Call or WhatsApp: **0711 175 616**
