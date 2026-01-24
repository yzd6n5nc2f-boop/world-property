"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Heart, MapPin } from "lucide-react";
import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSavedStore } from "@/lib/stores/saved-store";
import { usePreferencesStore } from "@/lib/stores/preferences-store";
import { convert, mockFxRates } from "@/lib/fx/mock-rates";
import { cn } from "@/lib/utils/cn";
import { formatArea, formatDualPrice } from "@/lib/utils/format";

type ListingCardProps = {
  listing: Listing;
  highlighted?: boolean;
  onHover?: (id?: string) => void;
};

export function ListingCard({ listing, highlighted, onHover }: ListingCardProps) {
  const { savedListingIds, hydrate: hydrateSaved, toggleListing } = useSavedStore();
  const { displayCurrency, showLocalCurrency, hydrate: hydratePreferences } = usePreferencesStore();

  useEffect(() => {
    void hydrateSaved();
    hydratePreferences();
  }, [hydratePreferences, hydrateSaved]);

  const isSaved = savedListingIds.includes(listing.id);

  const meta = useMemo(
    () =>
      [
        `${listing.beds} beds`,
        `${listing.baths} baths`,
        formatArea(listing.areaSqm)
      ].join(" · "),
    [listing.areaSqm, listing.baths, listing.beds]
  );

  const convertedValue = convert(listing.price.salePrice, listing.currency, displayCurrency, mockFxRates);
  const dualPrice = formatDualPrice(
    listing.price.salePrice,
    listing.currency,
    displayCurrency,
    convertedValue,
    showLocalCurrency
  );

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft",
        highlighted && "border-primary/60 shadow-soft"
      )}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(undefined)}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground">BUY</Badge>
          <Badge variant="secondary" className="bg-background/85 text-foreground">
            {listing.propertyType}
          </Badge>
        </div>
        <Button
          size="icon"
          variant={isSaved ? "default" : "secondary"}
          className="absolute right-3 top-3"
          onClick={() => void toggleListing(listing.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
        >
          <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
        </Button>
      </div>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-base font-semibold">{listing.title}</h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {listing.city}, {listing.country}
            </p>
          </div>
          <div className="text-right">
            <p className="whitespace-nowrap text-base font-semibold text-primary">{dualPrice.local}</p>
            {dualPrice.converted && <p className="text-xs text-muted-foreground">{dualPrice.converted}</p>}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{meta}</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        <Button asChild variant="outline" className="mt-1">
          <Link href={`/listing/${listing.id}`}>View details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
