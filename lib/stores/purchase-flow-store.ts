"use client";

import { create } from "zustand";
import type { OfferStub } from "@/src/domain/offer/offer.types";
import type { LegalWorkflowStage } from "@/src/domain/legal/legal.types";

export type SupportMode = "human" | "ai";

export type PurchaseFlowMessage = {
  id: string;
  author: "system" | "ai" | "buyer";
  content: string;
  createdAt: string;
};

export interface PurchaseFlowState {
  selectedSupportMode: SupportMode;
  activeOffer: OfferStub | null;
  legalCaseId: string | null;
  workflowStage: LegalWorkflowStage;
  checklist: string[];
  messages: PurchaseFlowMessage[];
  drawerOpen: boolean;
  hydrated: boolean;
  hydrate: () => void;
  setSupportMode: (mode: SupportMode) => void;
  setDrawerOpen: (open: boolean) => void;
  setWorkflowStage: (stage: LegalWorkflowStage) => void;
  setChecklist: (items: string[]) => void;
  addMessage: (message: PurchaseFlowMessage) => void;
  setActiveOffer: (offer: OfferStub, caseId: string) => void;
  resetFlow: () => void;
}

type PurchaseFlowSnapshot = Pick<
  PurchaseFlowState,
  "selectedSupportMode" | "activeOffer" | "legalCaseId" | "workflowStage" | "checklist" | "messages"
>;

const storageKey = "wp_purchase_flow";

const defaultSnapshot: PurchaseFlowSnapshot = {
  selectedSupportMode: "human",
  activeOffer: null,
  legalCaseId: null,
  workflowStage: "OfferCreated",
  checklist: [],
  messages: []
};

function readSnapshot(): PurchaseFlowSnapshot {
  if (typeof window === "undefined") return defaultSnapshot;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultSnapshot;
    const parsed = JSON.parse(raw) as Partial<PurchaseFlowSnapshot>;
    return {
      selectedSupportMode: parsed.selectedSupportMode ?? defaultSnapshot.selectedSupportMode,
      activeOffer: parsed.activeOffer ?? defaultSnapshot.activeOffer,
      legalCaseId: parsed.legalCaseId ?? defaultSnapshot.legalCaseId,
      workflowStage: parsed.workflowStage ?? defaultSnapshot.workflowStage,
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : defaultSnapshot.checklist,
      messages: Array.isArray(parsed.messages) ? parsed.messages : defaultSnapshot.messages
    };
  } catch (error) {
    return defaultSnapshot;
  }
}

function persistSnapshot(snapshot: PurchaseFlowSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
}

function toSnapshot(state: PurchaseFlowState): PurchaseFlowSnapshot {
  return {
    selectedSupportMode: state.selectedSupportMode,
    activeOffer: state.activeOffer,
    legalCaseId: state.legalCaseId,
    workflowStage: state.workflowStage,
    checklist: state.checklist,
    messages: state.messages
  };
}

export const usePurchaseFlowStore = create<PurchaseFlowState>((set, get) => ({
  ...defaultSnapshot,
  drawerOpen: false,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const snapshot = readSnapshot();
    set({ ...snapshot, hydrated: true });
  },
  setSupportMode: (mode) =>
    set((state) => {
      const next = { ...state, selectedSupportMode: mode };
      persistSnapshot(toSnapshot(next));
      return next;
    }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setWorkflowStage: (stage) =>
    set((state) => {
      const next = { ...state, workflowStage: stage };
      persistSnapshot(toSnapshot(next));
      return next;
    }),
  setChecklist: (items) =>
    set((state) => {
      const next = { ...state, checklist: items };
      persistSnapshot(toSnapshot(next));
      return next;
    }),
  addMessage: (message) =>
    set((state) => {
      const next = { ...state, messages: [...state.messages, message] };
      persistSnapshot(toSnapshot(next));
      return next;
    }),
  setActiveOffer: (offer, caseId) =>
    set((state) => {
      const next = { ...state, activeOffer: offer, legalCaseId: caseId };
      persistSnapshot(toSnapshot(next));
      return next;
    }),
  resetFlow: () =>
    set(() => {
      persistSnapshot(defaultSnapshot);
      return { ...defaultSnapshot, drawerOpen: false, hydrated: true };
    })
}));
