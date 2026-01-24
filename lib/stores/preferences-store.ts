"use client";

import { create } from "zustand";

type PreferencesState = {
  displayCurrency: string;
  showLocalCurrency: boolean;
  hydrated: boolean;
  hydrate: () => void;
  setDisplayCurrency: (currency: string) => void;
  toggleShowLocalCurrency: () => void;
};

type PreferencesSnapshot = Pick<PreferencesState, "displayCurrency" | "showLocalCurrency">;

const storageKey = "wp_preferences";

const defaultSnapshot: PreferencesSnapshot = {
  displayCurrency: "GBP",
  showLocalCurrency: true
};

function readSnapshot(): PreferencesSnapshot {
  if (typeof window === "undefined") return defaultSnapshot;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultSnapshot;
    const parsed = JSON.parse(raw) as Partial<PreferencesSnapshot>;
    return {
      displayCurrency: typeof parsed.displayCurrency === "string" ? parsed.displayCurrency : defaultSnapshot.displayCurrency,
      showLocalCurrency: typeof parsed.showLocalCurrency === "boolean" ? parsed.showLocalCurrency : defaultSnapshot.showLocalCurrency
    };
  } catch (error) {
    return defaultSnapshot;
  }
}

function persistSnapshot(snapshot: PreferencesSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
}

function toSnapshot(state: PreferencesState): PreferencesSnapshot {
  return {
    displayCurrency: state.displayCurrency,
    showLocalCurrency: state.showLocalCurrency
  };
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...defaultSnapshot,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const snapshot = readSnapshot();
    set({ ...snapshot, hydrated: true });
  },
  setDisplayCurrency: (currency) =>
    set((state) => {
      const next: PreferencesState = {
        ...state,
        displayCurrency: currency.toUpperCase()
      };
      persistSnapshot(toSnapshot(next));
      return next;
    }),
  toggleShowLocalCurrency: () =>
    set((state) => {
      const next: PreferencesState = {
        ...state,
        showLocalCurrency: !state.showLocalCurrency
      };
      persistSnapshot(toSnapshot(next));
      return next;
    })
}));
