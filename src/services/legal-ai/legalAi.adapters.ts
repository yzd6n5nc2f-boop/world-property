/**
 * TODO: Provide adapters that map between provider-specific formats
 * and the shared legal AI contracts.
 */

import type {
  LegalAiConsultationRequestStub,
  LegalAiConsultationResponseStub,
} from "./legalAi.types";

export interface LegalAiAdapter {
  toProviderPayload(request: LegalAiConsultationRequestStub): unknown;
  fromProviderPayload(payload: unknown): LegalAiConsultationResponseStub;
}

export const legalAiAdapterStub: LegalAiAdapter = {
  toProviderPayload(request) {
    return {
      request,
      note: "TODO: Map to provider payload.",
    };
  },
  fromProviderPayload(payload) {
    void payload;

    return {
      clarifyingQuestions: [],
      readinessSummary: "TODO: Parse provider payload into summary.",
      recommendedNextStage: "AIConsultation",
    };
  },
};
