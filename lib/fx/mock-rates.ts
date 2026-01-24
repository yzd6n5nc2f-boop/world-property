export const mockFxRates = {
  base: "GBP",
  rates: {
    GBP: 1,
    EUR: 1.17,
    USD: 1.28,
    NGN: 1985,
    ZAR: 23.9,
    AED: 4.7,
    CAD: 1.74,
    AUD: 1.93,
    CHF: 1.13,
    SGD: 1.72,
    JPY: 191.5,
    INR: 106.4,
    BRL: 7.1,
    MXN: 24.6,
    NZD: 2.08
  }
} as const;

type RatesMap = Record<string, number>;

type FxRates = {
  base: string;
  rates: RatesMap;
};

function normaliseCurrency(currency: string) {
  return currency.trim().toUpperCase();
}

export function convert(value: number, fromCurrency: string, toCurrency: string, rates: FxRates = mockFxRates) {
  const from = normaliseCurrency(fromCurrency);
  const to = normaliseCurrency(toCurrency);

  if (!Number.isFinite(value)) return undefined;
  if (from === to) return value;

  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];

  if (!fromRate || !toRate) return undefined;

  const valueInBase = value / fromRate;
  return valueInBase * toRate;
}

export const supportedCurrencies = Object.keys(mockFxRates.rates);
