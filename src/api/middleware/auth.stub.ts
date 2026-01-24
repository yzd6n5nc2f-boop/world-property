/**
 * TODO: Implement request authentication and authorization helpers.
 * Keep middleware concerns isolated from route handlers.
 */

export interface AuthContextStub {
  actorId: string | null;
  roles: string[];
}

export const resolveAuthContextStub = async (): Promise<AuthContextStub> => {
  return {
    actorId: null,
    roles: [],
  };
};
