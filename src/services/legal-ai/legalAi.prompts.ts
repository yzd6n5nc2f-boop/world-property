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
    system: "TODO: Define legal AI system prompt.",
    user: `TODO: Define consultation prompt for case ${request.caseId}.`,
  };
};
