/**
 * TODO: Validate and normalize country playbook configurations before use.
 * This should eventually enforce coverage for all legal workflow stages.
 */

import type { LegalPlaybookStub } from "./legal.playbook.types";

export interface LegalPlaybookSchemaResult {
  success: boolean;
  issues: string[];
}

export const validateLegalPlaybookStub = (
  playbook: LegalPlaybookStub,
): LegalPlaybookSchemaResult => {
  void playbook;

  return {
    success: true,
    issues: [],
  };
};
