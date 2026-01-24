# World Property — buyer-first global property MVP

World Property is a global, map-based property platform focused on one outcome: buying property anywhere with legal clarity.

This MVP is **front-end only**, uses **LocalStorage persistence**, and is designed to deploy quickly to **Azure Static Web Apps**.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui-style components (local)
- MapLibre GL JS with OpenStreetMap tiles
- Zod + React Hook Form
- Zustand state management

## Key MVP features

- Map-first buyer search with clustering
- Buyer-focused filters (price, beds, property type, text search)
- Currency preference store with dual-price display (mock FX)
- Listing detail experience with legal readiness scaffolding
- Buy Journey page with country-specific checklist mock
- Listing wizard for properties for sale (local persistence)
- Saved listings and saved searches (local persistence)
- Authentication UI shell (stub)
- AI Concierge UX scaffold (stub)

## Local development

### 1) Install dependencies

```bash
npm install
```

### 2) Run the dev server

```bash
npm run dev
```

Then open:

- http://localhost:3000

### 3) Type-check (optional but recommended)

```bash
npm run typecheck
```

### 4) Production build (static export)

```bash
npm run build
```

This generates a static export in the `out/` directory.

## Azure Static Web Apps deployment

This project is configured for static export and Azure SWA-friendly routing.

### Option A — Azure Static Web Apps (GitHub integration)

1. Push this repository to GitHub.
2. In the Azure Portal, create a **Static Web App**.
3. Use these build settings:
   - **Framework preset:** `Next.js`
   - **App location:** `/`
   - **Api location:** *(leave empty)*
   - **Output location:** `out`
4. Azure will run `npm install` and `npm run build` automatically.

> Because this project uses `output: "export"`, the deployable artifacts live in `out/`.

### Option B — SWA CLI local emulation

Install the SWA CLI if you do not have it yet:

```bash
npm install -g @azure/static-web-apps-cli
```

Run the app with SWA CLI:

```bash
npm run swa:dev
```

This command:

- starts Next.js locally
- proxies it through the SWA CLI at a local URL

## Notes on static export and listings

- The `/listing/[id]` route is statically generated for seeded listings.
- Listings created locally in `/host` are persisted and appear in search results, but their detail pages are not pre-rendered in a static export.
- This is acceptable for the MVP and can be addressed later by introducing server rendering or an API.

## LocalStorage keys used

- `wp_listings_user`
- `wp_saved_listings`
- `wp_saved_searches`
- `wp_auth_stub`
- `wp_preferences`

## Useful scripts

```bash
npm run dev        # Start Next.js dev server
npm run build      # Static export build
npm run start      # Starts Next.js server (non-static mode)
npm run lint       # Next.js lint
npm run typecheck  # TypeScript check
npm run swa:dev    # SWA CLI local proxy + dev server
```

## Project structure

- `app/` — routes
- `components/` — UI and shared components
- `features/` — feature modules (search, listing, host, saved)
- `lib/` — API stubs, schemas, stores, utils
- `data/mock-listings.ts` — seeded global listings
- `types/` — shared types

---

This MVP is intentionally backend-free so it can launch quickly and be iterated on safely.
