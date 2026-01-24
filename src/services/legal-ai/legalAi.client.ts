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
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      clarifyingQuestions: [
        `What is your target completion timeline for ${request.countryCode}?`,
        "Will the purchase be cash or financed, and do you already have proof of funds?",
        "Are there any residency or usage requirements we should consider?"
      ],
      readinessSummary:
        "We have a baseline brief. Next steps include confirming funds, gathering buyer identity documentation, and requesting the draft legal pack.",
      recommendedNextStage: "LegalPackRequested"
    };
  },
};
