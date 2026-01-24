"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookmarkCheck, HeartOff, MapPinned } from "lucide-react";
import type { Listing, ListingQuery } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingCard } from "@/features/listing/listing-card";
import { getAllListings } from "@/lib/api/listings";
import { useSavedStore } from "@/lib/stores/saved-store";
import { formatCurrency } from "@/lib/utils/format";

function searchSummary(query: ListingQuery) {
  const parts = [query.mode === "stay" ? "Stay" : "Buy / Rent"];
  if (query.text) parts.push(`in ${query.text}`);
  if (query.minBeds) parts.push(`${query.minBeds}+ beds`);
  if (query.minPrice || query.maxPrice) {
    parts.push(
      `price ${query.minPrice ? formatCurrency(query.minPrice, "GBP") : "any"} - ${query.maxPrice ? formatCurrency(query.maxPrice, "GBP") : "any"}`
    );
  }
  if (query.propertyTypes?.length) parts.push(query.propertyTypes.join(", "));
  return parts.join(" · ");
}

export function SavedPage() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const { savedListingIds, savedSearches, hydrate } = useSavedStore();

  useEffect(() => {
    void hydrate();
    void getAllListings().then(setAllListings);
  }, [hydrate]);

  const savedListings = useMemo(
    () => allListings.filter((listing) => savedListingIds.includes(listing.id)),
    [allListings, savedListingIds]
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Saved items</h1>
        <p className="text-muted-foreground">Your saved listings and searches live locally on this device.</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Saved listings</h2>
          <Badge variant="secondary">{savedListings.length}</Badge>
        </div>
        {savedListings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-start gap-2 p-6 text-sm text-muted-foreground">
              <HeartOff className="h-5 w-5 text-primary" />
              Nothing saved yet. Tap the heart on any listing to find it here.
              <Button asChild variant="outline" size="sm">
                <Link href="/search?mode=buy">Browse listings</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {savedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPinned className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Saved searches</h2>
          <Badge variant="secondary">{savedSearches.length}</Badge>
        </div>
        {savedSearches.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Save a search from the map view to access it here later.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savedSearches.map((query, index) => (
              <Card key={`${query.mode}-${index}`}>
                <CardHeader>
                  <CardTitle className="text-base">{query.mode === "stay" ? "Stay search" : "Buy / rent search"}</CardTitle>
                  <CardDescription>{searchSummary(query)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/search?mode=${query.mode}`}>Open search</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
