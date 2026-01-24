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
    <div className="flex flex-col gap-16 pb-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-8 py-12 shadow-soft md:px-14 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.18),_transparent_58%)]" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-accent/35 via-accent/10 to-transparent" aria-hidden />
        <div className="relative z-10 flex max-w-4xl flex-col gap-8">
          <Badge className="w-fit gap-1 border border-primary/15 bg-primary/10 text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Buyer-first global property
          </Badge>
          <div className="flex flex-col gap-5">
            <h1 className="text-5xl font-semibold tracking-tight text-foreground md:text-7xl">
              Buy property anywhere with legal clarity.
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Navigate cross-border purchases with guided legal steps, document-ready checklists, and currency clarity built into every search.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8">
              <Link href="/search">
                Search properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 border-border/80 bg-background/80 text-muted-foreground hover:bg-background">
              <Link href="/legal">
                See the buying journey
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 pt-4 md:grid-cols-3">
            {trustHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="h-full border-border/80 bg-card/95">
                  <CardContent className="flex h-full items-start gap-4 p-5">
                    <div className="rounded-2xl border border-primary/10 bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-semibold">{item.label}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-3xl font-semibold tracking-tight">Featured cities</h2>
            <p className="max-w-2xl text-muted-foreground">Jump into buyer-ready listings around the world.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCities.map((city) => (
            <Card key={city.city} className="border-border/80">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold">{city.city}</p>
                  <p className="text-sm text-muted-foreground">{city.country}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="px-4">
                  <Link href={`/search?text=${encodeURIComponent(city.city)}`}>Explore</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-3xl font-semibold tracking-tight">Featured listings</h2>
          <p className="max-w-3xl text-muted-foreground">A curated snapshot of buyer opportunities with legal clarity.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
