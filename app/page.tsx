"use client";

import Link from "next/link";
import { ArrowRight, Building2, Globe2, Hotel, Sparkles } from "lucide-react";
import { featuredCities, featuredListings } from "@/data/mock-listings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListingCard } from "@/features/listing/listing-card";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/60 p-8 shadow-soft md:p-12">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
        <div className="relative z-10 flex flex-col gap-6">
          <Badge className="w-fit gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Map-first global property
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Find places to live, invest, or stay — anywhere
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            World Property merges long-term homes with short stays in one unified experience. Search the map, compare opportunities, and move faster.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/search?mode=buy">
                Search Buy / Rent
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/search?mode=stay">
                Search Stay
                <Hotel className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Buy or rent", icon: Building2, text: "Browse agent-led listings with map filters." },
              { label: "Stay anywhere", icon: Hotel, text: "Layer in dates and nightly pricing instantly." },
              { label: "Global coverage", icon: Globe2, text: "Scan cities worldwide without switching tools." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-border/70 bg-background/80">
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
            <p className="text-muted-foreground">Tap a city to jump into map search.</p>
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
                  <Link href={`/search?mode=buy&text=${encodeURIComponent(city.city)}`}>Explore</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Featured listings</h2>
          <p className="text-muted-foreground">A curated preview from around the world.</p>
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
