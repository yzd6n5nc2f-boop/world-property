"use client";

import { useMemo } from "react";
import { Map, Sparkles } from "lucide-react";
import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListingCard } from "@/features/listing/listing-card";

type ResultsPanelProps = {
  listings: Listing[];
  selectedId?: string;
  onSelect: (id?: string) => void;
};

export function ResultsPanel({ listings, selectedId, onSelect }: ResultsPanelProps) {
  const summary = useMemo(() => {
    if (listings.length === 0) return "No results in this area yet.";
    if (listings.length === 1) return "1 listing matches";
    return `${listings.length} listings match`;
  }, [listings.length]);

  return (
    <section className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">{summary}</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Map-synced
        </Badge>
      </div>
      <ScrollArea className="flex-1 rounded-2xl border border-border/60 bg-background/40 p-1">
        <div className="grid gap-4 p-3">
          {listings.map((listing) => (
            <div key={listing.id} onFocus={() => onSelect(listing.id)}>
              <ListingCard listing={listing} highlighted={selectedId === listing.id} onHover={onSelect} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}
