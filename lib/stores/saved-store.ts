"use client";

import { create } from "zustand";
import type { ListingQuery } from "@/types/listing";
import { getSavedListingIds, getSavedSearches, saveSearch, toggleSavedListing } from "@/lib/api/saved";

type SavedState = {
  savedListingIds: string[];
  savedSearches: ListingQuery[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggleListing: (id: string) => Promise<void>;
  storeSearch: (query: ListingQuery) => Promise<void>;
};

export const useSavedStore = create<SavedState>((set, get) => ({
  savedListingIds: [],
  savedSearches: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    const [ids, searches] = await Promise.all([getSavedListingIds(), getSavedSearches()]);
    set({ savedListingIds: ids, savedSearches: searches, hydrated: true });
  },
  toggleListing: async (id: string) => {
    const ids = await toggleSavedListing(id);
    set({ savedListingIds: ids });
  },
  storeSearch: async (query: ListingQuery) => {
    const searches = await saveSearch(query);
    set({ savedSearches: searches });
  }
}));
