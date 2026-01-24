/**
 * TODO: Implement structured logging helpers with consistent metadata fields.
 */

export interface LogContextStub {
  scope: string;
  metadata?: Record<string, unknown>;
}

export const logInfoStub = (message: string, context?: LogContextStub): void => {
  void message;
  void context;
};
