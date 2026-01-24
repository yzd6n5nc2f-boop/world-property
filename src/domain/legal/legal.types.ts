/**
 * TODO: Model legal workflow entities, statuses, and shared contracts.
 * This will support offer-to-completion automation across jurisdictions.
 */

export type LegalWorkflowStage =
  | "OfferCreated"
  | "AIConsultation"
  | "LegalPackRequested"
  | "DueDiligence"
  | "Contracts"
  | "Completion";

export interface LegalCaseStub {
  id: string;
  propertyId: string;
  stage: LegalWorkflowStage;
}

export const LEGAL_DOMAIN_PLACEHOLDER = "legal-domain-stub" as const;
