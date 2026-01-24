"use client";

import { create } from "zustand";
import { getAuthState, signInStub, signOutStub } from "@/lib/api/auth";

type AuthState = {
  user: { email: string; name: string; lastLoginAt: string } | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    const user = await getAuthState();
    set({ user, hydrated: true });
  },
  signIn: async (email, name) => {
    const user = await signInStub(email, name);
    set({ user });
  },
  signOut: async () => {
    await signOutStub();
    set({ user: null });
  }
}));
