/**
 * TODO: Implement offer API endpoints that trigger legal workflow automation.
 * This route is intentionally a stub and is not yet wired into Next.js routing.
 */

export interface OfferRouteHandlerResultStub {
  status: number;
  body: Record<string, unknown>;
}

export const handleOffersRouteStub = async (): Promise<OfferRouteHandlerResultStub> => {
  return {
    status: 501,
    body: {
      message: "TODO: Implement offers route handler.",
    },
  };
};
