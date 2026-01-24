"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Heart, MapPin } from "lucide-react";
import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSavedStore } from "@/lib/stores/saved-store";
import { cn } from "@/lib/utils/cn";
import { formatArea, formatCurrency } from "@/lib/utils/format";

type ListingCardProps = {
  listing: Listing;
  highlighted?: boolean;
  onHover?: (id?: string) => void;
};

function priceLabel(listing: Listing) {
  if (listing.mode === "buy") {
    return formatCurrency(listing.price.salePrice ?? 0, listing.currency);
  }
  if (listing.mode === "rent") {
    return `${formatCurrency(listing.price.rentPerMonth ?? 0, listing.currency)} / month`;
  }
  return `${formatCurrency(listing.price.nightRate ?? 0, listing.currency)} / night`;
}

export function ListingCard({ listing, highlighted, onHover }: ListingCardProps) {
  const { savedListingIds, hydrate, toggleListing } = useSavedStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

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
          <Badge>{listing.mode.toUpperCase()}</Badge>
          <Badge variant="secondary" className="bg-background/80 text-foreground">
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
          <p className="whitespace-nowrap text-base font-semibold text-primary">{priceLabel(listing)}</p>
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
