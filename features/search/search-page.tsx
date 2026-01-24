"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingsMap } from "@/components/map/listings-map";
import { FiltersPanel } from "@/features/search/filters-panel";
import { ResultsPanel } from "@/features/search/results-panel";
import { listListings } from "@/lib/api/listings";
import { useSavedStore } from "@/lib/stores/saved-store";
import { useSearchStore } from "@/lib/stores/search-store";
import { parseFilters, writeFiltersToParams } from "@/lib/utils/search-params";

export function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const paramsString = params.toString();
  const parsedParams = useMemo(() => parseFilters(new URLSearchParams(paramsString)), [paramsString]);

  const {
    filters,
    bounds,
    results,
    selectedId,
    isMapDirty,
    setFilters,
    resetFilters,
    setBounds,
    setResults,
    setSelectedId,
    markMapDirty,
    toQuery
  } = useSearchStore();

  const { storeSearch, hydrate: hydrateSaved } = useSavedStore();

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const hasInitialised = useRef(false);

  const updateUrl = useCallback(
    (snapshot: typeof filters) => {
      const nextParams = writeFiltersToParams(new URLSearchParams(paramsString), snapshot);
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `/search?${nextQuery}` : "/search", { scroll: false });
    },
    [filters, paramsString, router]
  );

  const runSearch = useCallback(async () => {
    if (!bounds) return;
    setLoading(true);
    const query = toQuery();
    const data = await listListings(query);
    setResults(data);
    markMapDirty(false);
    setLoading(false);
  }, [bounds, markMapDirty, setResults, toQuery]);

  useEffect(() => {
    void hydrateSaved();
  }, [hydrateSaved]);

  useEffect(() => {
    if (hasInitialised.current) return;
    resetFilters();
    setFilters(parsedParams);
    hasInitialised.current = true;
  }, [parsedParams, resetFilters, setFilters]);

  useEffect(() => {
    if (!hasInitialised.current) return;
    setFilters(parsedParams);
  }, [parsedParams, setFilters]);

  useEffect(() => {
    if (!hasInitialised.current || !bounds) return;
    startTransition(() => {
      void runSearch();
    });
  }, [bounds, runSearch, startTransition]);

  const onReset = () => {
    resetFilters();
    updateUrl({
      text: "",
      minPrice: undefined,
      maxPrice: undefined,
      minBeds: undefined,
      propertyTypes: []
    });
  };

  const onFiltersChange = (next: {
    text: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    propertyTypes: typeof filters.propertyTypes;
  }) => {
    setFilters(next);
    updateUrl({ ...filters, ...next });
  };

  const onBoundsChange = (nextBounds: typeof bounds) => {
    setBounds(nextBounds);
    markMapDirty(true);
  };

  return (
    <div className="flex flex-col gap-5 lg:h-[calc(100vh-8rem)] lg:flex-row">
      <div className="flex w-full flex-col gap-5 lg:w-[420px]">
        <FiltersPanel
          text={filters.text}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          minBeds={filters.minBeds}
          propertyTypes={filters.propertyTypes}
          onFiltersChange={onFiltersChange}
          onReset={onReset}
          onSaveSearch={() => void storeSearch(toQuery())}
        />
        <ResultsPanel listings={results} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className="relative flex-1">
        <ListingsMap
          listings={results}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onBoundsChange={onBoundsChange}
          onSearchArea={() => void runSearch()}
          isDirty={isMapDirty}
        />
        {(loading || isPending) && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/95 px-4 py-2 text-sm shadow-soft">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Updating results…
            </div>
          </div>
        )}
        {results.length === 0 && !loading && (
          <div className="pointer-events-none absolute inset-x-6 bottom-6">
            <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-soft">
              <MapPinned className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Try expanding your search</p>
                <p className="text-sm text-muted-foreground">Zoom out or reset filters to discover more locations.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={onReset}>
                  Reset filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
