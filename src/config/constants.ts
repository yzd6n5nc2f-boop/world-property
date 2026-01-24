/**
 * TODO: Provide shared constants for workflow stages, feature flags,
 * and default configuration values.
 */

export const LEGAL_WORKFLOW_STAGE_ORDER = [
  "OfferCreated",
  "AIConsultation",
  "LegalPackRequested",
  "DueDiligence",
  "Contracts",
  "Completion",
] as const;

export const APP_CONSTANTS_STUB = {
  legalWorkflowVersion: 1,
};
