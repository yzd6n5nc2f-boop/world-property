/**
 * TODO: Implement property API endpoints that support listing, retrieval,
 * and legal workflow enrichment.
 * This route is intentionally a stub and is not yet wired into Next.js routing.
 */

export interface PropertiesRouteHandlerResultStub {
  status: number;
  body: Record<string, unknown>;
}

export const handlePropertiesRouteStub = async (): Promise<PropertiesRouteHandlerResultStub> => {
  return {
    status: 501,
    body: {
      message: "TODO: Implement properties route handler.",
    },
  };
};
