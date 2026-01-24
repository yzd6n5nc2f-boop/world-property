/**
 * TODO: Implement a legal workflow state machine that enforces allowed transitions,
 * side effects, and orchestration hooks.
 */

import type { LegalWorkflowStage } from "@/src/domain/legal/legal.types";
import { LEGAL_WORKFLOW_EVENT_SEQUENCE, type LegalWorkflowEventStub } from "./legalWorkflow.events";

export interface LegalWorkflowStateStub {
  caseId: string;
  stage: LegalWorkflowStage;
}

export const transitionLegalWorkflowStub = (
  state: LegalWorkflowStateStub,
  event: LegalWorkflowEventStub,
): LegalWorkflowStateStub => {
  const currentIndex = LEGAL_WORKFLOW_EVENT_SEQUENCE.indexOf(state.stage);
  const targetIndex = LEGAL_WORKFLOW_EVENT_SEQUENCE.indexOf(event.targetStage);

  if (targetIndex === -1) return state;
  if (targetIndex === currentIndex || targetIndex === currentIndex + 1) {
    return {
      ...state,
      stage: event.targetStage,
    };
  }

  return state;
};
