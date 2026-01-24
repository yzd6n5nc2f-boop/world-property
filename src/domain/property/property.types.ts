/**
 * TODO: Define core property domain types shared across workflows and APIs.
 * This module should remain free of framework-specific concerns.
 */

export type PropertyId = string;

export interface PropertyStub {
  id: PropertyId;
  countryCode: string;
  status: "draft" | "active" | "archived";
}

export const PROPERTY_DOMAIN_PLACEHOLDER = "property-domain-stub" as const;
