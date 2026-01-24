import { mockListings } from "@/data/mock-listings";
import type { Bounds, Listing, ListingQuery, PropertyType } from "@/types/listing";
import { readStorage, storageKeys, writeStorage } from "@/lib/utils/storage";

const latency = 120;

function delay<T>(value: T, timeout = latency) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), timeout));
}

function matchesBounds(listing: Listing, bounds?: Bounds) {
  if (!bounds) return true;
  return (
    listing.lat <= bounds.north &&
    listing.lat >= bounds.south &&
    listing.lng <= bounds.east &&
    listing.lng >= bounds.west
  );
}

function matchesText(listing: Listing, text?: string) {
  if (!text) return true;
  const query = text.trim().toLowerCase();
  if (!query) return true;
  return (
    listing.city.toLowerCase().includes(query) ||
    listing.country.toLowerCase().includes(query) ||
    listing.title.toLowerCase().includes(query)
  );
}

function matchesBeds(listing: Listing, minBeds?: number) {
  if (!minBeds) return true;
  return listing.beds >= minBeds;
}

function listingPriceValue(listing: Listing) {
  return listing.price.salePrice;
}

function matchesPrice(listing: Listing, minPrice?: number, maxPrice?: number) {
  const value = listingPriceValue(listing);
  if (minPrice !== undefined && value < minPrice) return false;
  if (maxPrice !== undefined && value > maxPrice) return false;
  return true;
}

function matchesTypes(listing: Listing, propertyTypes?: PropertyType[]) {
  if (!propertyTypes || propertyTypes.length === 0) return true;
  return propertyTypes.includes(listing.propertyType);
}

function readUserListings() {
  return readStorage<Listing[]>(storageKeys.listings, []);
}

export async function getAllListings() {
  return delay([...mockListings, ...readUserListings()]);
}

export async function listListings(query: ListingQuery) {
  const listings = [...mockListings, ...readUserListings()];

  const filtered = listings.filter((listing) => {
    return (
      matchesBounds(listing, query.bounds) &&
      matchesText(listing, query.text) &&
      matchesBeds(listing, query.minBeds) &&
      matchesPrice(listing, query.minPrice, query.maxPrice) &&
      matchesTypes(listing, query.propertyTypes)
    );
  });

  return delay(filtered);
}

export async function getListingById(id: string) {
  const listings = [...mockListings, ...readUserListings()];
  const listing = listings.find((entry) => entry.id === id);
  return delay(listing);
}

export async function createListing(input: Listing) {
  const current = readUserListings();
  const next = [input, ...current];
  writeStorage(storageKeys.listings, next);
  return delay(input, 180);
}
