"use client";

import { Suspense } from "react";
import { SearchPage } from "@/features/search/search-page";

export default function SearchRoute() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Map-first search</h1>
        <p className="text-muted-foreground">
          Pan the map, refine filters, and save the results that matter to you.
        </p>
      </header>
      <Suspense fallback={<div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">Loading search…</div>}>
        <SearchPage initialMode="buy" />
      </Suspense>
    </div>
  );
}
