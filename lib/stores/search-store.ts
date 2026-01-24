"use client";

import { create } from "zustand";
import type { Bounds, Listing, ListingMode, ListingQuery, PropertyType } from "@/types/listing";

type Filters = {
  mode: ListingMode;
  text: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  propertyTypes: PropertyType[];
  startDate?: string;
  endDate?: string;
};

type SearchState = {
  filters: Filters;
  bounds?: Bounds;
  results: Listing[];
  selectedId?: string;
  isMapDirty: boolean;
  setFilters: (next: Partial<Filters>) => void;
  resetFilters: (mode: ListingMode) => void;
  setBounds: (bounds?: Bounds) => void;
  setResults: (results: Listing[]) => void;
  setSelectedId: (id?: string) => void;
  markMapDirty: (dirty: boolean) => void;
  toQuery: () => ListingQuery;
};

const defaultFilters = (mode: ListingMode): Filters => ({
  mode,
  text: "",
  minPrice: undefined,
  maxPrice: undefined,
  minBeds: undefined,
  propertyTypes: [],
  startDate: undefined,
  endDate: undefined
});

export const useSearchStore = create<SearchState>((set, get) => ({
  filters: defaultFilters("buy"),
  bounds: undefined,
  results: [],
  selectedId: undefined,
  isMapDirty: false,
  setFilters: (next) =>
    set((state) => ({
      filters: { ...state.filters, ...next }
    })),
  resetFilters: (mode) =>
    set({
      filters: defaultFilters(mode),
      bounds: undefined,
      results: [],
      selectedId: undefined,
      isMapDirty: false
    }),
  setBounds: (bounds) => set({ bounds }),
  setResults: (results) => set({ results }),
  setSelectedId: (id) => set({ selectedId: id }),
  markMapDirty: (dirty) => set({ isMapDirty: dirty }),
  toQuery: () => {
    const { filters, bounds } = get();
    const query: ListingQuery = {
      mode: filters.mode,
      text: filters.text || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBeds: filters.minBeds,
      propertyTypes: filters.propertyTypes.length ? filters.propertyTypes : undefined,
      bounds,
      startDate: filters.startDate,
      endDate: filters.endDate
    };
    return query;
  }
}));
