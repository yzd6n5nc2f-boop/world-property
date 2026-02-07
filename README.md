# World Property

World Property is a buyer-first, map-based property platform. The frontend UI remains intact and now runs with a lightweight SQLite backend.

## Features

- Global buyer search with clustering
- Buyer-focused filters (price, beds, property type, text search)
- Listing detail pages
- Host/agent listing wizard
- Saved listings and saved searches
- Authentication shell

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Zustand + React Hook Form + Zod
- MapLibre GL JS
- SQLite (`better-sqlite3`)

## Backend architecture

- Database file: `data/world-property.sqlite`
- API routes: `app/api/**`
- DB/service layer: `lib/server/db.ts`
- Error helpers: `lib/server/http.ts`
- Seed source: `data/mock-listings.ts`

### Core API endpoints

- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `POST /api/users/register`
- `POST /api/agents/register`
- `GET /api/listings`
- `POST /api/listings/search`
- `GET /api/listings/:id`
- `POST /api/listings` (requires registered user)
- `GET|POST /api/saved/listings`
- `GET|POST /api/saved/searches`
- `GET /api/health`

## Local setup

1. Install dependencies

```bash
npm install
```

2. Start app (frontend + backend together)

```bash
npm run dev
```

3. Open

- `http://localhost:3000`

## Full-stack test

Run a one-command frontend + backend smoke test:

```bash
npm run test:fullstack
```

This starts Next.js, executes the smoke test, and stops the server automatically.

`test:smoke` is also available when you already have a server running and can provide `BASE_URL`.

## Useful scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test:smoke
npm run test:fullstack
```

## Notes

- This app now requires server runtime support for API routes and SQLite.
- Static export mode was removed.
