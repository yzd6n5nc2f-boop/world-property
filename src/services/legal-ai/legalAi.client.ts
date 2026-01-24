/**
 * TODO: Implement a legal AI client that coordinates prompt assembly,
 * provider selection, and structured response parsing.
 */

import type {
  LegalAiConsultationRequestStub,
  LegalAiConsultationResponseStub,
} from "./legalAi.types";

export interface LegalAiClient {
  consult(request: LegalAiConsultationRequestStub): Promise<LegalAiConsultationResponseStub>;
}

export const legalAiClientStub: LegalAiClient = {
  async consult(request) {
    void request;

    return {
      clarifyingQuestions: [],
      readinessSummary: "TODO: Populate legal readiness summary.",
      recommendedNextStage: "AIConsultation",
    };
  },
};
