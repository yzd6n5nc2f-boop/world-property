/**
 * TODO: Define provider-agnostic legal AI request/response contracts.
 * These types will support adapters, prompts, and orchestration layers.
 */

import type { LegalWorkflowStage } from "@/src/domain/legal/legal.types";

export interface LegalAiConsultationRequestStub {
  caseId: string;
  stage: LegalWorkflowStage;
  countryCode: string;
  contextSummary: string;
}

export interface LegalAiConsultationResponseStub {
  clarifyingQuestions: string[];
  readinessSummary: string;
  recommendedNextStage: LegalWorkflowStage;
}

export const LEGAL_AI_PLACEHOLDER_PROVIDER = "legal-ai-stub" as const;
