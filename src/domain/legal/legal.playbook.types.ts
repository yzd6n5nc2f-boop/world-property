/**
 * TODO: Define country-specific legal playbooks that describe required documents,
 * standard checks, risk flags, timelines, and fee categories.
 */

import type { LegalWorkflowStage } from "./legal.types";

export interface LegalPlaybookStub {
  countryCode: string;
  stages: LegalWorkflowStage[];
  requiredDocuments: string[];
  standardChecks: string[];
  riskFlags: string[];
  typicalTimelineDays: number;
  feeCategories: string[];
}

export const LEGAL_PLAYBOOK_PLACEHOLDER: LegalPlaybookStub = {
  countryCode: "XX",
  stages: ["OfferCreated", "AIConsultation", "Completion"],
  requiredDocuments: [],
  standardChecks: [],
  riskFlags: [],
  typicalTimelineDays: 0,
  feeCategories: [],
};
