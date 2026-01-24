import type { ListingQuery } from "@/types/listing";
import { readStorage, storageKeys, writeStorage } from "@/lib/utils/storage";

const latency = 80;

function delay<T>(value: T, timeout = latency) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), timeout));
}

export async function getSavedListingIds() {
  return delay(readStorage<string[]>(storageKeys.savedListings, []));
}

export async function toggleSavedListing(id: string) {
  const current = readStorage<string[]>(storageKeys.savedListings, []);
  const exists = current.includes(id);
  const next = exists ? current.filter((entry) => entry !== id) : [id, ...current];
  writeStorage(storageKeys.savedListings, next);
  return delay(next);
}

export async function getSavedSearches() {
  return delay(readStorage<ListingQuery[]>(storageKeys.savedSearches, []));
}

export async function saveSearch(query: ListingQuery) {
  const current = readStorage<ListingQuery[]>(storageKeys.savedSearches, []);
  const next = [query, ...current].slice(0, 20);
  writeStorage(storageKeys.savedSearches, next);
  return delay(next);
}
