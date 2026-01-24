"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, Landmark, ShieldCheck, Sparkles } from "lucide-react";
import { featuredCities, featuredListings } from "@/data/mock-listings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListingCard } from "@/features/listing/listing-card";

const trustHighlights = [
  {
    label: "Country-specific legal steps",
    text: "Understand what happens next in each market before you commit.",
    icon: ShieldCheck
  },
  {
    label: "Local + converted prices",
    text: "Compare listings in their native currency and your home currency instantly.",
    icon: Landmark
  },
  {
    label: "Guided purchase checklist",
    text: "Stay organised from offer to completion with a clear buyer journey.",
    icon: ClipboardCheck
  }
] as const;

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-background to-accent/80 p-8 shadow-soft md:p-12">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" aria-hidden />
        <div className="relative z-10 flex flex-col gap-6">
          <Badge className="w-fit gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Buyer-first global property
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Buy property anywhere with legal clarity.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Navigate cross-border purchases with guided legal steps, document-ready checklists, and currency clarity built into every search.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/search">
                Search properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/legal">
                See the buying journey
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {trustHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-border/70 bg-background/85">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured cities</h2>
            <p className="text-muted-foreground">Jump into buyer-ready listings around the world.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCities.map((city) => (
            <Card key={city.city} className="border-border/70">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-lg font-semibold">{city.city}</p>
                  <p className="text-sm text-muted-foreground">{city.country}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/search?text=${encodeURIComponent(city.city)}`}>Explore</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Featured listings</h2>
          <p className="text-muted-foreground">A curated snapshot of buyer opportunities with legal clarity.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
