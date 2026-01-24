/**
 * TODO: Standardize currency representations and FX conversion contracts.
 * Keep this module pure and reusable across services and workflows.
 */

export type CurrencyCode = string;

export interface MoneyStub {
  amountMinor: number;
  currencyCode: CurrencyCode;
}

export const CURRENCY_DOMAIN_PLACEHOLDER = "currency-domain-stub" as const;
