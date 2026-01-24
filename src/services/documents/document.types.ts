/**
 * TODO: Define document generation contracts for legal packs and checklists.
 */

import type { LegalWorkflowStage } from "@/src/domain/legal/legal.types";

export interface DocumentRequestStub {
  caseId: string;
  stage: LegalWorkflowStage;
  templateKey: string;
}

export interface DocumentArtifactStub {
  id: string;
  templateKey: string;
  status: "pending" | "ready" | "failed";
}

export const DOCUMENT_SERVICE_PLACEHOLDER = "document-service-stub" as const;
