/**
 * TODO: Provide legal workflow step descriptors that can be used by orchestrators,
 * UI progress tracking, and background processors.
 */

import type { LegalWorkflowStage } from "@/src/domain/legal/legal.types";

export interface LegalWorkflowStepStub {
  stage: LegalWorkflowStage;
  description: string;
}

export const LEGAL_WORKFLOW_STEPS: LegalWorkflowStepStub[] = [
  { stage: "OfferCreated", description: "Offer has been created." },
  { stage: "AIConsultation", description: "AI legal consultation is pending." },
  { stage: "LegalPackRequested", description: "Legal document pack requested." },
  { stage: "DueDiligence", description: "Due diligence in progress." },
  { stage: "Contracts", description: "Contracts being prepared and reviewed." },
  { stage: "Completion", description: "Transaction completion." },
];
