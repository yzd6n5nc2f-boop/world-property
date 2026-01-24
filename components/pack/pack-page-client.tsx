"use client";

import { useEffect, useState } from "react";
import { FileText, Printer, Sparkles } from "lucide-react";
import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getListingById } from "@/lib/api/listings";
import { formatCurrency } from "@/lib/utils/format";

type PackPageClientProps = {
  listingId: string;
};

export function PackPageClient({ listingId }: PackPageClientProps) {
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    let active = true;
    if (!listingId) return;
    void getListingById(listingId).then((result) => {
      if (!active) return;
      setListing(result ?? null);
    });
    return () => {
      active = false;
    };
  }, [listingId]);

  if (!listing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="max-w-md border-border/70 bg-card p-6 text-center shadow-sm">
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Preparing the investor pack…</p>
            <p className="text-xs text-muted-foreground">This pack is generated from locally stored listing data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge className="w-fit gap-1 border border-primary/15 bg-primary/10 text-primary">
          <FileText className="h-3.5 w-3.5" />
          Investor Pack (mock)
        </Badge>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{listing.title}</h1>
            <p className="text-muted-foreground">
              {listing.city}, {listing.country}
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print pack
          </Button>
        </div>
      </header>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{listing.propertyType}</Badge>
              <Badge variant="outline">{listing.hostType}</Badge>
              <Badge className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Legal pack ready
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{listing.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {listing.images.slice(0, 4).map((image) => (
                <div key={image} className="overflow-hidden rounded-2xl border border-border/70">
                  <img src={image} alt="Property preview" className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/40 p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Price</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(listing.price.salePrice, listing.currency)}</p>
              <p className="text-xs text-muted-foreground">Converted pricing is handled at checkout.</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Buyer-ready highlights</p>
              <ul className="space-y-2">
                <li>• Title documentation prepared for review.</li>
                <li>• AI legal coordinator available for fast-track workflows.</li>
                <li>• Clear country-specific checklist provided.</li>
              </ul>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Next steps</p>
              <ul className="space-y-2">
                <li>• Confirm proof of funds and buyer identity.</li>
                <li>• Request the draft legal pack.</li>
                <li>• Align on contract timelines with your solicitor.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
