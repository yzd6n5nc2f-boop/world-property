import type { ListingQuery } from "@/types/listing";
import { requestJson } from "@/lib/api/http";
import { getSessionHeaders } from "@/lib/api/session";

export async function getSavedListingIds() {
  return requestJson<string[]>("/api/saved/listings", {
    headers: getSessionHeaders()
  });
}

export async function toggleSavedListing(id: string) {
  return requestJson<string[]>("/api/saved/listings", {
    method: "POST",
    headers: getSessionHeaders(),
    body: JSON.stringify({ listingId: id })
  });
}

export async function getSavedSearches() {
  return requestJson<ListingQuery[]>("/api/saved/searches", {
    headers: getSessionHeaders()
  });
}

export async function saveSearch(query: ListingQuery) {
  return requestJson<ListingQuery[]>("/api/saved/searches", {
    method: "POST",
    headers: getSessionHeaders(),
    body: JSON.stringify({ query })
  });
}
