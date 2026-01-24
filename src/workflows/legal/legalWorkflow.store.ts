/**
 * TODO: Provide persistence helpers for legal workflow state snapshots,
 * event logs, and recovery hooks.
 */

import type { LegalWorkflowStateStub } from "./legalWorkflow.machine";

export interface LegalWorkflowStore {
  load(caseId: string): Promise<LegalWorkflowStateStub | null>;
  save(state: LegalWorkflowStateStub): Promise<void>;
}

export const legalWorkflowStoreStub: LegalWorkflowStore = {
  async load(caseId) {
    void caseId;
    return null;
  },
  async save(state) {
    void state;
  },
};
