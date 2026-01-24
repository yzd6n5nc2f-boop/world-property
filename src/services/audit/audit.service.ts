/**
 * TODO: Implement audit logging sinks and structured event emission helpers.
 */

import type { AuditEventStub } from "./audit.types";

export const recordAuditEventStub = async (event: AuditEventStub): Promise<void> => {
  void event;
};
