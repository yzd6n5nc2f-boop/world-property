import "server-only";

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { mockListings } from "@/data/mock-listings";
import { listingSchema, searchFilterSchema } from "@/lib/schemas/listing";
import type { HostType, Listing, ListingQuery, PropertyType } from "@/types/listing";

type UserRole = "user" | "agent";
type PrincipalType = "user" | "device";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  last_login_at: string;
};

type AgentProfileRow = {
  user_id: string;
  company: string | null;
  phone: string | null;
  license_number: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

type ListingRow = {
  id: string;
  mode: string;
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  sale_price: number | null;
  currency: string;
  beds: number;
  baths: number;
  area_sqm: number;
  property_type: PropertyType;
  images_json: string;
  amenities_json: string;
  host_type: HostType;
  created_at: string;
  owner_user_id: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
};

export type AgentProfile = {
  userId: string;
  company?: string;
  phone?: string;
  licenseNumber?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

export type UpsertUserInput = {
  email: string;
  name: string;
  role?: UserRole;
};

export type UpsertAgentInput = {
  email: string;
  name: string;
  company?: string;
  phone?: string;
  licenseNumber?: string;
  bio?: string;
};

export type Principal = {
  type: PrincipalType;
  id: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const DATABASE_PATH = process.env.WP_DB_PATH ?? path.join(process.cwd(), "data", "world-property.sqlite");
const SYSTEM_USER_ID = "system-seed";
const SYSTEM_EMAIL = "seed@world-property.local";

declare global {
  // eslint-disable-next-line no-var
  var wpDatabase: Database.Database | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function normaliseOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function rowToUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  };
}

function rowToAgentProfile(row: AgentProfileRow): AgentProfile {
  return {
    userId: row.user_id,
    company: row.company ?? undefined,
    phone: row.phone ?? undefined,
    licenseNumber: row.license_number ?? undefined,
    bio: row.bio ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    country: row.country,
    city: row.city,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    price: {
      salePrice: row.sale_price ?? 0
    },
    currency: row.currency,
    beds: row.beds,
    baths: row.baths,
    areaSqm: row.area_sqm,
    propertyType: row.property_type,
    images: JSON.parse(row.images_json) as string[],
    amenities: JSON.parse(row.amenities_json) as string[],
    hostType: row.host_type,
    createdAt: row.created_at
  };
}

function getDb() {
  if (!globalThis.wpDatabase) {
    fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
    const db = new Database(DATABASE_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initialiseSchema(db);
    seedListings(db);
    globalThis.wpDatabase = db;
  }
  return globalThis.wpDatabase;
}

function initialiseSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'agent')),
      created_at TEXT NOT NULL,
      last_login_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      company TEXT,
      phone TEXT,
      license_number TEXT,
      bio TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      mode TEXT NOT NULL DEFAULT 'buy' CHECK(mode IN ('buy', 'rent', 'stay')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      sale_price REAL NOT NULL,
      currency TEXT NOT NULL,
      beds INTEGER NOT NULL,
      baths INTEGER NOT NULL,
      area_sqm REAL NOT NULL,
      property_type TEXT NOT NULL CHECK(property_type IN ('apartment', 'house', 'villa', 'condo', 'cabin', 'loft', 'townhouse')),
      images_json TEXT NOT NULL,
      amenities_json TEXT NOT NULL,
      host_type TEXT NOT NULL CHECK(host_type IN ('agent', 'owner')),
      created_at TEXT NOT NULL,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS saved_listings (
      principal_type TEXT NOT NULL CHECK(principal_type IN ('user', 'device')),
      principal_id TEXT NOT NULL,
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (principal_type, principal_id, listing_id)
    );

    CREATE TABLE IF NOT EXISTS saved_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      principal_type TEXT NOT NULL CHECK(principal_type IN ('user', 'device')),
      principal_id TEXT NOT NULL,
      query_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_listings_mode_created_at ON listings(mode, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_listings_coords ON listings(lat, lng);
    CREATE INDEX IF NOT EXISTS idx_saved_searches_principal ON saved_searches(principal_type, principal_id, id DESC);
  `);
}

function seedListings(db: Database.Database) {
  const listingCount = db.prepare("SELECT COUNT(*) as count FROM listings").get() as { count: number };
  if (listingCount.count > 0) {
    return;
  }

  const seededAt = nowIso();
  db.prepare(
    `
      INSERT OR IGNORE INTO users (id, email, name, role, created_at, last_login_at)
      VALUES (?, ?, ?, 'agent', ?, ?)
    `
  ).run(SYSTEM_USER_ID, SYSTEM_EMAIL, "Seed Data", seededAt, seededAt);

  const insertListing = db.prepare(
    `
      INSERT OR IGNORE INTO listings (
      id, mode, title, description, country, city, address, lat, lng,
      sale_price, currency, beds, baths, area_sqm, property_type,
      images_json, amenities_json, host_type, created_at, owner_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  );

  const tx = db.transaction((rows: Listing[]) => {
    for (const listing of rows) {
      insertListing.run(
        listing.id,
        "buy",
        listing.title,
        listing.description,
        listing.country,
        listing.city,
        listing.address,
        listing.lat,
        listing.lng,
        listing.price.salePrice,
        listing.currency,
        listing.beds,
        listing.baths,
        listing.areaSqm,
        listing.propertyType,
        JSON.stringify(listing.images),
        JSON.stringify(listing.amenities),
        listing.hostType,
        listing.createdAt,
        SYSTEM_USER_ID
      );
    }
  });

  tx(mockListings);
}

function findUserByEmail(email: string) {
  const db = getDb();
  return (
    (db.prepare("SELECT id, email, name, role, created_at, last_login_at FROM users WHERE email = ?").get(normaliseEmail(email)) as
      | UserRow
      | undefined) ?? null
  );
}

function buildListingSearchSql(query: ListingQuery) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  clauses.push("mode = 'buy'");

  const text = query.text?.trim().toLowerCase();
  if (text) {
    const like = `%${text}%`;
    clauses.push("(LOWER(city) LIKE ? OR LOWER(country) LIKE ? OR LOWER(title) LIKE ?)");
    params.push(like, like, like);
  }

  if (query.minBeds !== undefined) {
    clauses.push("beds >= ?");
    params.push(query.minBeds);
  }

  if (query.minPrice !== undefined) {
    clauses.push("COALESCE(sale_price, 0) >= ?");
    params.push(query.minPrice);
  }

  if (query.maxPrice !== undefined) {
    clauses.push("COALESCE(sale_price, 0) <= ?");
    params.push(query.maxPrice);
  }

  if (query.propertyTypes?.length) {
    clauses.push(`property_type IN (${query.propertyTypes.map(() => "?").join(",")})`);
    params.push(...query.propertyTypes);
  }

  if (query.bounds) {
    clauses.push("lat <= ? AND lat >= ? AND lng <= ? AND lng >= ?");
    params.push(query.bounds.north, query.bounds.south, query.bounds.east, query.bounds.west);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `
    SELECT
      id, mode, title, description, country, city, address, lat, lng,
      sale_price, currency, beds, baths, area_sqm, property_type,
      images_json, amenities_json, host_type, created_at, owner_user_id
    FROM listings
    ${whereSql}
    ORDER BY datetime(created_at) DESC
  `;

  return { sql, params };
}

export function getDatabasePath() {
  getDb();
  return DATABASE_PATH;
}

export function listAllListings() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT
          id, mode, title, description, country, city, address, lat, lng,
          sale_price, currency, beds, baths, area_sqm, property_type,
          images_json, amenities_json, host_type, created_at, owner_user_id
        FROM listings
        ORDER BY datetime(created_at) DESC
      `
    )
    .all() as ListingRow[];

  return rows.map(rowToListing);
}

export function searchListings(query: ListingQuery) {
  const parsed = searchFilterSchema.parse(query);
  const db = getDb();
  const { sql, params } = buildListingSearchSql(parsed);
  const rows = db.prepare(sql).all(...params) as ListingRow[];
  return rows.map(rowToListing);
}

export function findListingById(id: string) {
  const db = getDb();
  const row =
    (db
      .prepare(
        `
          SELECT
            id, mode, title, description, country, city, address, lat, lng,
            sale_price, currency, beds, baths, area_sqm, property_type,
            images_json, amenities_json, host_type, created_at, owner_user_id
          FROM listings
          WHERE id = ?
        `
      )
      .get(id) as ListingRow | undefined) ?? null;

  return row ? rowToListing(row) : null;
}

export function upsertUserAccount(input: UpsertUserInput) {
  const db = getDb();
  const email = normaliseEmail(input.email);
  const name = input.name.trim();
  const role = input.role ?? "user";

  if (!email) {
    throw new ApiError(400, "Email is required.");
  }
  if (!name) {
    throw new ApiError(400, "Name is required.");
  }

  const current = findUserByEmail(email);
  const timestamp = nowIso();

  if (current) {
    const nextRole: UserRole = current.role === "agent" ? "agent" : role;
    db.prepare("UPDATE users SET name = ?, role = ?, last_login_at = ? WHERE id = ?").run(name, nextRole, timestamp, current.id);
    const updated = findUserByEmail(email);
    if (!updated) {
      throw new ApiError(500, "User could not be loaded after update.");
    }
    return rowToUser(updated);
  }

  const id = randomUUID();
  db.prepare("INSERT INTO users (id, email, name, role, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    id,
    email,
    name,
    role,
    timestamp,
    timestamp
  );

  return {
    id,
    email,
    name,
    role,
    createdAt: timestamp,
    lastLoginAt: timestamp
  } satisfies PublicUser;
}

export function upsertAgentAccount(input: UpsertAgentInput) {
  const user = upsertUserAccount({
    email: input.email,
    name: input.name,
    role: "agent"
  });
  const db = getDb();
  const timestamp = nowIso();

  db.prepare(
    `
      INSERT INTO agent_profiles (user_id, company, phone, license_number, bio, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        company = excluded.company,
        phone = excluded.phone,
        license_number = excluded.license_number,
        bio = excluded.bio,
        updated_at = excluded.updated_at
    `
  ).run(
    user.id,
    normaliseOptional(input.company) ?? null,
    normaliseOptional(input.phone) ?? null,
    normaliseOptional(input.licenseNumber) ?? null,
    normaliseOptional(input.bio) ?? null,
    timestamp,
    timestamp
  );

  const profile = db
    .prepare("SELECT user_id, company, phone, license_number, bio, created_at, updated_at FROM agent_profiles WHERE user_id = ?")
    .get(user.id) as AgentProfileRow;

  return {
    user,
    profile: rowToAgentProfile(profile)
  };
}

export function createListingForUser(listing: Listing, ownerEmail: string) {
  const db = getDb();
  const owner = findUserByEmail(ownerEmail);
  if (!owner) {
    throw new ApiError(401, "Sign in before publishing a listing.");
  }

  const parsed = listingSchema.parse(listing);

  try {
    db.prepare(
      `
        INSERT INTO listings (
          id, mode, title, description, country, city, address, lat, lng,
          sale_price, currency, beds, baths, area_sqm, property_type,
          images_json, amenities_json, host_type, created_at, owner_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      parsed.id,
      "buy",
      parsed.title,
      parsed.description,
      parsed.country,
      parsed.city,
      parsed.address,
      parsed.lat,
      parsed.lng,
      parsed.price.salePrice,
      parsed.currency,
      parsed.beds,
      parsed.baths,
      parsed.areaSqm,
      parsed.propertyType,
      JSON.stringify(parsed.images),
      JSON.stringify(parsed.amenities),
      parsed.hostType,
      parsed.createdAt,
      owner.id
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed: listings.id")) {
      throw new ApiError(409, "A listing with this ID already exists.");
    }
    throw error;
  }

  return parsed;
}

export function resolvePrincipalFromHeaders(headers: Headers): Principal {
  const email = headers.get("x-user-email");
  if (email) {
    const user = findUserByEmail(email);
    if (user) {
      return { type: "user", id: user.id };
    }
  }

  const deviceId = headers.get("x-device-id")?.trim();
  if (deviceId) {
    return { type: "device", id: deviceId };
  }

  throw new ApiError(400, "Missing session headers. Send x-user-email or x-device-id.");
}

export function listSavedListingIds(principal: Principal) {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT listing_id
        FROM saved_listings
        WHERE principal_type = ? AND principal_id = ?
        ORDER BY datetime(created_at) DESC
      `
    )
    .all(principal.type, principal.id) as { listing_id: string }[];

  return rows.map((row) => row.listing_id);
}

export function toggleSavedListingForPrincipal(principal: Principal, listingId: string) {
  const db = getDb();
  const listing = findListingById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found.");
  }

  const exists = db
    .prepare("SELECT 1 as present FROM saved_listings WHERE principal_type = ? AND principal_id = ? AND listing_id = ?")
    .get(principal.type, principal.id, listingId) as { present: number } | undefined;

  if (exists) {
    db.prepare("DELETE FROM saved_listings WHERE principal_type = ? AND principal_id = ? AND listing_id = ?").run(
      principal.type,
      principal.id,
      listingId
    );
  } else {
    db.prepare("INSERT INTO saved_listings (principal_type, principal_id, listing_id, created_at) VALUES (?, ?, ?, ?)").run(
      principal.type,
      principal.id,
      listingId,
      nowIso()
    );
  }

  return listSavedListingIds(principal);
}

export function listSavedSearches(principal: Principal) {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT query_json
        FROM saved_searches
        WHERE principal_type = ? AND principal_id = ?
        ORDER BY id DESC
        LIMIT 20
      `
    )
    .all(principal.type, principal.id) as { query_json: string }[];

  const queries: ListingQuery[] = [];
  for (const row of rows) {
    try {
      const parsed = searchFilterSchema.safeParse(JSON.parse(row.query_json));
      if (parsed.success) {
        queries.push(parsed.data);
      }
    } catch {
      // Ignore corrupted payloads without blocking valid rows.
    }
  }

  return queries;
}

export function saveSearchForPrincipal(principal: Principal, query: ListingQuery) {
  const db = getDb();
  const parsed = searchFilterSchema.parse(query);

  db.prepare("INSERT INTO saved_searches (principal_type, principal_id, query_json, created_at) VALUES (?, ?, ?, ?)").run(
    principal.type,
    principal.id,
    JSON.stringify(parsed),
    nowIso()
  );

  db.prepare(
    `
      DELETE FROM saved_searches
      WHERE id IN (
        SELECT id
        FROM saved_searches
        WHERE principal_type = ? AND principal_id = ?
        ORDER BY id DESC
        LIMIT -1 OFFSET 20
      )
    `
  ).run(principal.type, principal.id);

  return listSavedSearches(principal);
}
