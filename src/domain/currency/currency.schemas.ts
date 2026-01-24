/**
 * TODO: Validate currency codes, minor-unit ranges,
 * and cross-currency conversion inputs.
 */

import type { MoneyStub } from "./currency.types";

export interface CurrencySchemaResult {
  success: boolean;
  issues: string[];
}

export const validateMoneyStub = (input: MoneyStub): CurrencySchemaResult => {
  void input;

  return {
    success: true,
    issues: [],
  };
};
