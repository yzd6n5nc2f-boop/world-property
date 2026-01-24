"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { Bath, BedDouble, CalendarRange, Calculator, Heart, MapPin, ShieldCheck } from "lucide-react";
import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/features/search/date-range-picker";
import { getListingById } from "@/lib/api/listings";
import { useSavedStore } from "@/lib/stores/saved-store";
import { formatArea, formatCurrency, formatNumber } from "@/lib/utils/format";

type ListingDetailProps = {
  id: string;
};

type StayDates = { startDate?: string; endDate?: string };

function nightlyBreakdown(listing: Listing, dates: StayDates) {
  const nightly = listing.price.nightRate ?? 0;
  if (!dates.startDate || !dates.endDate) {
    return { nights: 0, nightly, subtotal: 0, fees: 0, total: 0 };
  }
  const nights = Math.max(differenceInCalendarDays(new Date(dates.endDate), new Date(dates.startDate)), 1);
  const subtotal = nights * nightly;
  const fees = subtotal * 0.12;
  const total = subtotal + fees;
  return { nights, nightly, subtotal, fees, total };
}

function mortgageEstimate(listing: Listing) {
  const price = listing.price.salePrice ?? listing.price.rentPerMonth ?? 0;
  const deposit = price * 0.2;
  const loan = price - deposit;
  const monthly = loan * 0.0048;
  return { deposit, monthly };
}

export function ListingDetail({ id }: ListingDetailProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<StayDates>({
    startDate: new Date().toISOString(),
    endDate: addDays(new Date(), 5).toISOString()
  });

  const { savedListingIds, hydrate, toggleListing } = useSavedStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getListingById(id).then((result) => {
      if (!active) return;
      setListing(result ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const isSaved = listing ? savedListingIds.includes(listing.id) : false;

  const pricing = useMemo(() => (listing ? nightlyBreakdown(listing, dates) : null), [dates, listing]);
  const mortgage = useMemo(() => (listing ? mortgageEstimate(listing) : null), [listing]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading listing…</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-semibold">Listing not found</h1>
        <p className="text-muted-foreground">The listing may have moved or is no longer available locally.</p>
        <Button asChild>
          <Link href="/search?mode=buy">Back to search</Link>
        </Button>
      </div>
    );
  }

  const headlinePrice =
    listing.mode === "buy"
      ? formatCurrency(listing.price.salePrice ?? 0, listing.currency)
      : listing.mode === "rent"
        ? `${formatCurrency(listing.price.rentPerMonth ?? 0, listing.currency)} / month`
        : `${formatCurrency(listing.price.nightRate ?? 0, listing.currency)} / night`;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{listing.mode.toUpperCase()}</Badge>
          <Badge variant="secondary">{listing.propertyType}</Badge>
          <Badge variant="outline">{listing.hostType}</Badge>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{listing.title}</h1>
            <p className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {listing.address}, {listing.city}, {listing.country}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-2xl font-semibold text-primary">{headlinePrice}</p>
            <Button variant={isSaved ? "default" : "outline"} className="gap-2" onClick={() => void toggleListing(listing.id)}>
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save listing"}
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {listing.images.map((image, index) => (
          <div key={image} className={`overflow-hidden rounded-2xl border border-border/60 ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
            <img src={image} alt={`${listing.title} photo ${index + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Everything you need to know at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <BedDouble className="h-4 w-4 text-primary" />
                  {listing.beds} beds
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bath className="h-4 w-4 text-primary" />
                  {listing.baths} baths
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {formatArea(listing.areaSqm)}
                </div>
              </div>
              <Separator />
              <p className="text-muted-foreground">{listing.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="rounded-lg px-3 py-1">
                  {amenity}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {listing.mode === "stay" && pricing && (
            <Card className="border-primary/30 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-primary" />
                  Plan your stay
                </CardTitle>
                <CardDescription>Availability is mocked for the MVP.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DateRangePicker startDate={dates.startDate} endDate={dates.endDate} onChange={setDates} />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>
                      {formatCurrency(pricing.nightly, listing.currency)} × {pricing.nights} nights
                    </span>
                    <span>{formatCurrency(pricing.subtotal, listing.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Service fee</span>
                    <span>{formatCurrency(pricing.fees, listing.currency)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(pricing.total, listing.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {listing.mode !== "stay" && mortgage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Mortgage snapshot
                </CardTitle>
                <CardDescription>Illustrative estimate using a 20% deposit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Estimated deposit</span>
                  <span className="font-semibold">{formatCurrency(mortgage.deposit, listing.currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated monthly</span>
                  <span className="font-semibold text-primary">{formatCurrency(mortgage.monthly, listing.currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Refine this in a real calculator post-MVP.</p>
              </CardContent>
            </Card>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full gap-2">Contact host / agent</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact {listing.hostType}</DialogTitle>
                <DialogDescription>
                  Messaging is mocked in this MVP. A real integration can plug into this modal later.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm">
                <p className="font-medium">Suggested opener</p>
                <p className="text-muted-foreground">
                  Hi, I'm interested in {listing.title}. Is it still available from {format(new Date(listing.createdAt), "dd MMM yyyy")}?
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Send message</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card className="border-dashed">
            <CardContent className="space-y-1 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Listing ID</p>
              <p>{listing.id}</p>
              <p>Published {format(new Date(listing.createdAt), "dd MMM yyyy")}</p>
              <p>{formatNumber(Math.round(Math.abs(listing.lat * listing.lng)))} monthly views (mock)</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
