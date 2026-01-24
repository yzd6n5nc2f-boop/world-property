"use client";

import { Suspense } from "react";
import { SearchPage } from "@/features/search/search-page";

export default function SearchRoute() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Search</p>
        <h1 className="text-3xl font-semibold tracking-tight">Global buying search</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pan the map, refine investor-grade filters, and compare local prices alongside your preferred currency.
        </p>
      </header>
      <Suspense fallback={<div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">Loading search…</div>}>
        <SearchPage />
      </Suspense>
    </div>
  );
}
