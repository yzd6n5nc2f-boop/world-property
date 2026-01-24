"use client";

import { create } from "zustand";
import type { Bounds, Listing, ListingQuery, PropertyType } from "@/types/listing";

type Filters = {
  text: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  propertyTypes: PropertyType[];
};

type SearchState = {
  filters: Filters;
  bounds?: Bounds;
  results: Listing[];
  selectedId?: string;
  isMapDirty: boolean;
  setFilters: (next: Partial<Filters>) => void;
  resetFilters: () => void;
  setBounds: (bounds?: Bounds) => void;
  setResults: (results: Listing[]) => void;
  setSelectedId: (id?: string) => void;
  markMapDirty: (dirty: boolean) => void;
  toQuery: () => ListingQuery;
};

const defaultFilters = (): Filters => ({
  text: "",
  minPrice: undefined,
  maxPrice: undefined,
  minBeds: undefined,
  propertyTypes: []
});

export const useSearchStore = create<SearchState>((set, get) => ({
  filters: defaultFilters(),
  bounds: undefined,
  results: [],
  selectedId: undefined,
  isMapDirty: false,
  setFilters: (next) =>
    set((state) => ({
      filters: { ...state.filters, ...next }
    })),
  resetFilters: () =>
    set({
      filters: defaultFilters(),
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
      text: filters.text || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBeds: filters.minBeds,
      propertyTypes: filters.propertyTypes.length ? filters.propertyTypes : undefined,
      bounds
    };
    return query;
  }
}));
