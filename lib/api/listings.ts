import type { Listing, ListingQuery } from "@/types/listing";
import { requestJson } from "@/lib/api/http";
import { getSessionHeaders } from "@/lib/api/session";

export async function getAllListings() {
  return requestJson<Listing[]>("/api/listings");
}

export async function listListings(query: ListingQuery) {
  return requestJson<Listing[]>("/api/listings/search", {
    method: "POST",
    body: JSON.stringify(query)
  });
}

export async function getListingById(id: string) {
  return requestJson<Listing | null>(`/api/listings/${encodeURIComponent(id)}`);
}

export async function createListing(input: Listing) {
  return requestJson<Listing>("/api/listings", {
    method: "POST",
    headers: getSessionHeaders(),
    body: JSON.stringify({ listing: input })
  });
}
