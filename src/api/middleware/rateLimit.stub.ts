/**
 * TODO: Implement rate limiting guards for API routes.
 */

export interface RateLimitResultStub {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export const checkRateLimitStub = async (): Promise<RateLimitResultStub> => {
  return {
    allowed: true,
  };
};
