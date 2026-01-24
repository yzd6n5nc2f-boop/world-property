/**
 * TODO: Add validation for offer inputs, currency alignment,
 * and status transition rules.
 */

import type { OfferStub } from "./offer.types";

export interface OfferSchemaResult {
  success: boolean;
  issues: string[];
}

export const validateOfferStub = (input: OfferStub): OfferSchemaResult => {
  void input;

  return {
    success: true,
    issues: [],
  };
};
