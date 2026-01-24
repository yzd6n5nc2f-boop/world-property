/**
 * TODO: Capture offer lifecycle types and shared offer contracts.
 * Offers will be the primary trigger for legal workflow automation.
 */

export type OfferStatus = "created" | "accepted" | "rejected" | "withdrawn";

export interface OfferStub {
  id: string;
  propertyId: string;
  amountMinor: number;
  currencyCode: string;
  status: OfferStatus;
}

export const OFFER_DOMAIN_PLACEHOLDER = "offer-domain-stub" as const;
