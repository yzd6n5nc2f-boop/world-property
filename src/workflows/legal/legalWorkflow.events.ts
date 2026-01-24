/**
 * TODO: Define legal workflow events and their payload contracts.
 */

import type { LegalWorkflowStage } from "@/src/domain/legal/legal.types";

export type LegalWorkflowEventType =
  | "OfferCreated"
  | "AIConsultation"
  | "LegalPackRequested"
  | "DueDiligence"
  | "Contracts"
  | "Completion";

export interface LegalWorkflowEventStub {
  type: LegalWorkflowEventType;
  caseId: string;
  targetStage: LegalWorkflowStage;
}

export const LEGAL_WORKFLOW_EVENT_SEQUENCE: LegalWorkflowEventType[] = [
  "OfferCreated",
  "AIConsultation",
  "LegalPackRequested",
  "DueDiligence",
  "Contracts",
  "Completion",
];
