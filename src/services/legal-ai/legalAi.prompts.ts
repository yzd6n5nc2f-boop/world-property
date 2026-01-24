/**
 * TODO: Centralize prompt templates and prompt assembly helpers for legal AI.
 * Keep prompt logic isolated from provider-specific concerns.
 */

import type { LegalAiConsultationRequestStub } from "./legalAi.types";

export interface LegalAiPromptBundle {
  system: string;
  user: string;
}

export const buildLegalAiConsultationPrompts = (
  request: LegalAiConsultationRequestStub,
): LegalAiPromptBundle => {
  return {
    system:
      "You are a legal workflow coordinator that summarizes readiness, collects missing documents, and flags risks. Keep responses structured, concise, and risk-aware.",
    user: `Create a readiness summary for case ${request.caseId} in ${request.countryCode}. Current stage: ${request.stage}. Context: ${request.contextSummary}. Provide clarifying questions and the next recommended stage.`,
  };
};
