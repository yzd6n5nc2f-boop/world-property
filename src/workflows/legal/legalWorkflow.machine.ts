/**
 * TODO: Implement a legal workflow state machine that enforces allowed transitions,
 * side effects, and orchestration hooks.
 */

import type { LegalWorkflowStage } from "@/src/domain/legal/legal.types";
import type { LegalWorkflowEventStub } from "./legalWorkflow.events";

export interface LegalWorkflowStateStub {
  caseId: string;
  stage: LegalWorkflowStage;
}

export const transitionLegalWorkflowStub = (
  state: LegalWorkflowStateStub,
  event: LegalWorkflowEventStub,
): LegalWorkflowStateStub => {
  void event;

  return {
    ...state,
  };
};
