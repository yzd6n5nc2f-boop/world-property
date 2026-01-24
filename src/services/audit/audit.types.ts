/**
 * TODO: Define audit log event shapes for legal workflow automation.
 */

export interface AuditEventStub {
  id: string;
  type: string;
  occurredAtIso: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}

export const AUDIT_EVENT_PLACEHOLDER: AuditEventStub = {
  id: "audit-stub",
  type: "TODO.audit.event",
  occurredAtIso: new Date(0).toISOString(),
};
