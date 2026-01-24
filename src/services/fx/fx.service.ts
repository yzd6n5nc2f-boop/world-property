/**
 * TODO: Provide FX conversion services used by offers, pricing, and legal fees.
 * This will eventually wrap a real provider with caching and auditing.
 */

import type { CurrencyCode, MoneyStub } from "@/src/domain/currency/currency.types";

export interface FxQuoteStub {
  base: CurrencyCode;
  counter: CurrencyCode;
  rate: number;
}

export const convertMoneyStub = (
  money: MoneyStub,
  targetCurrency: CurrencyCode,
): MoneyStub => {
  void targetCurrency;

  return {
    ...money,
  };
};
