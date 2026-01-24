"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  FileCheck2,
  Heart,
  MapPin,
  Scale,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getListingById } from "@/lib/api/listings";
import { convert, mockFxRates } from "@/lib/fx/mock-rates";
import { usePreferencesStore } from "@/lib/stores/preferences-store";
import { useSavedStore } from "@/lib/stores/saved-store";
import { formatArea, formatDualPrice, formatNumber } from "@/lib/utils/format";

type ListingDetailProps = {
  id: string;
};

type LegalStep = {
  title: string;
  detail: string;
};

const legalTimeline: LegalStep[] = [
  { title: "Offer", detail: "Align on price, conditions, and timelines." },
  { title: "Due diligence", detail: "Verify title, zoning, and key documents." },
  { title: "Contracts", detail: "Review the draft contract and legal pack." },
  { title: "Completion", detail: "Sign, transfer funds, and register ownership." }
];

const countryChecklists: Record<string, string[]> = {
  "United Kingdom": [
    "Confirm proof of funds and mortgage readiness",
    "Instruct a solicitor and request the draft contract",
    "Review searches: title, local authority, environmental"
  ],
  Portugal: [
    "Apply for a fiscal number (NIF)",
    "Request the land registry certificate (Certidão Permanente)",
    "Check licensing and habitation certificate"
  ],
  "United Arab Emirates": [
    "Confirm freehold eligibility in the target area",
    "Review developer escrow and completion status",
    "Plan for transfer fees and trustee office steps"
  ],
  "United States": [
    "Clarify state-specific closing process and escrow",
    "Review title insurance commitment",
    "Prepare wiring instructions and identity verification"
  ]
};

function checklistForCountry(country: string) {
  return (
    countryChecklists[country] ?? [
      "Verify who can buy and any foreign ownership limits",
      "Request the title report, zoning confirmation, and recent tax receipts",
      "Confirm closing costs, transfer taxes, and registration steps"
    ]
  );
}

function legalFeeEstimate(price: number) {
  const diligence = price * 0.012;
  const legal = price * 0.009;
  const taxes = price * 0.018;
  return {
    diligence,
    legal,
    taxes,
    total: diligence + legal + taxes
  };
}

export function ListingDetail({ id }: ListingDetailProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  const { savedListingIds, hydrate: hydrateSaved, toggleListing } = useSavedStore();
  const { displayCurrency, showLocalCurrency, hydrate: hydratePreferences } = usePreferencesStore();

  useEffect(() => {
    void hydrateSaved();
    hydratePreferences();
  }, [hydratePreferences, hydrateSaved]);

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

  const convertedValue = listing
    ? convert(listing.price.salePrice, listing.currency, displayCurrency, mockFxRates)
    : undefined;

  const dualPrice = listing
    ? formatDualPrice(listing.price.salePrice, listing.currency, displayCurrency, convertedValue, showLocalCurrency)
    : null;

  const feeEstimate = listing ? legalFeeEstimate(listing.price.salePrice) : null;

  const checklist = useMemo(() => (listing ? checklistForCountry(listing.country) : []), [listing]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading listing…</p>
      </div>
    );
  }

  if (!listing || !dualPrice || !feeEstimate) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-semibold">Listing not found</h1>
        <p className="text-muted-foreground">The listing may have moved or is no longer available locally.</p>
        <Button asChild>
          <Link href="/search">Back to search</Link>
        </Button>
      </div>
    );
  }

  const timelineIndex = 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground">BUY</Badge>
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
            <div className="text-right">
              <p className="text-2xl font-semibold text-primary">{dualPrice.local}</p>
              {dualPrice.converted && <p className="text-xs text-muted-foreground">{dualPrice.converted}</p>}
            </div>
            <Button variant={isSaved ? "default" : "outline"} className="gap-2" onClick={() => void toggleListing(listing.id)}>
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save listing"}
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {listing.images.map((image, index) => (
          <div
            key={image}
            className={`overflow-hidden rounded-2xl border border-border/60 ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
          >
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

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Legal readiness
              </CardTitle>
              <CardDescription>
                A guided buyer journey tailored to {listing.country}. This differentiator keeps legal clarity front and centre.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                {legalTimeline.map((step, index) => {
                  const active = index === timelineIndex;
                  const complete = index < timelineIndex;
                  return (
                    <div key={step.title} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                            complete ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border"
                          }`}
                        >
                          {complete ? "✓" : index + 1}
                        </div>
                        {index < legalTimeline.length - 1 && <div className="mt-1 h-full w-px bg-border" aria-hidden />}
                      </div>
                      <div className="pb-4">
                        <p className="font-semibold">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                <p className="text-sm font-semibold text-foreground">Country checklist</p>
                <p className="text-xs text-muted-foreground">Mocked guidance based on {listing.country}.</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/30 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Buyer actions
              </CardTitle>
              <CardDescription>Move from interest to intent with guided next steps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Make an offer</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Make an offer</DialogTitle>
                    <DialogDescription>
                      Offer flows are stubbed for now. In a full version, this is where you would set price, contingencies, and timelines.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                    Suggested opening offer: aim for clarity on price, included fixtures, and legal pack timing.
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Close</Button>
                    <Button>Start offer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <FileCheck2 className="h-4 w-4" />
                    Request legal pack
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request legal pack</DialogTitle>
                    <DialogDescription>
                      Legal pack delivery is mocked. This scaffold highlights the product differentiator: clarity before commitment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                    Typical documents: proof of ownership, title documents, planning permissions, and recent tax receipts.
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Close</Button>
                    <Button>Request pack</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <p className="text-xs text-muted-foreground">Next: align on offer terms, then request the legal pack early.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Estimated buyer costs (mock)
              </CardTitle>
              <CardDescription>Indicative ranges for planning purposes only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Due diligence</span>
                <span className="font-semibold">{formatDualPrice(feeEstimate.diligence, listing.currency, displayCurrency, convert(feeEstimate.diligence, listing.currency, displayCurrency, mockFxRates), showLocalCurrency).local}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Legal fees</span>
                <span className="font-semibold">{formatDualPrice(feeEstimate.legal, listing.currency, displayCurrency, convert(feeEstimate.legal, listing.currency, displayCurrency, mockFxRates), showLocalCurrency).local}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Taxes & registration</span>
                <span className="font-semibold">{formatDualPrice(feeEstimate.taxes, listing.currency, displayCurrency, convert(feeEstimate.taxes, listing.currency, displayCurrency, mockFxRates), showLocalCurrency).local}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between font-semibold">
                <span>Total estimate</span>
                <span className="text-primary">{formatDualPrice(feeEstimate.total, listing.currency, displayCurrency, convert(feeEstimate.total, listing.currency, displayCurrency, mockFxRates), showLocalCurrency).local}</span>
              </div>
              <p className="text-xs text-muted-foreground">These placeholders reinforce the legal journey concept; connect real fee engines later.</p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="space-y-1 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Listing ID</p>
              <p>{listing.id}</p>
              <p>Published {format(new Date(listing.createdAt), "dd MMM yyyy")}</p>
              <p>{formatNumber(Math.round(Math.abs(listing.lat * listing.lng)))} buyer views this month (mock)</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
