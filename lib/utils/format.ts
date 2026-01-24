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

export function formatDualPrice(
  listingPriceLocal: number,
  listingCurrency: string,
  displayCurrency: string,
  convertedValue?: number,
  showLocalCurrency = true
) {
  const localLabel = formatCurrency(listingPriceLocal, listingCurrency);
  const convertedLabel =
    convertedValue === undefined ? undefined : formatCurrency(convertedValue, displayCurrency);

  if (showLocalCurrency) {
    if (!convertedLabel || listingCurrency === displayCurrency) return { local: localLabel };
    return {
      local: localLabel,
      converted: `(~${convertedLabel})`
    };
  }

  if (convertedLabel) {
    return {
      local: convertedLabel,
      converted: listingCurrency === displayCurrency ? undefined : `Local: ${localLabel}`
    };
  }

  return { local: localLabel };
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatArea(value: number) {
  return `${formatNumber(value)} sqm`;
}
