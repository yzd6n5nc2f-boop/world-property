export function formatCurrency(value: number, currency = "GBP") {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: value >= 1000 ? 0 : 2
    }).format(value);
  } catch (error) {
    return `${currency} ${value.toLocaleString()}`;
  }
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatArea(value: number) {
  return `${formatNumber(value)} sqm`;
}
