/**
 * TODO: Implement document pack generation, templating orchestration,
 * and provider integrations.
 */

import type { DocumentArtifactStub, DocumentRequestStub } from "./document.types";

export const requestDocumentStub = async (
  request: DocumentRequestStub,
): Promise<DocumentArtifactStub> => {
  void request;

  return {
    id: "document-stub",
    templateKey: "TODO-template",
    status: "pending",
  };
};
