// A map of supported currency codes to currency symbols.
const currencySymbols = {
  BTC: "Ƀ",
  ETH: "Ξ",
  USD: "$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  CHF: "Fr.",
  SEK: "kr",
  JPY: "¥",
  CNY: "¥",
  INR: "₹",
  RUB: "₽",
  AUD: "A$",
  HKD: "HK$",
  SGD: "S$",
  TWD: "NT$",
  BRL: "R$",
  KRW: "₩",
  ZAR: "R",
  MYR: "RM",
  IDR: "Rp",
  NZD: "NZ$",
  MXN: "MP$",
  PHP: "₱",
  DKK: "kr.",
  PLN: "zł",
  XAU: "XAU",
  XAG: "XAG",
  XDR: "XDR"
};

// A map of override objects to apply.
// Format:
// { location: { start: Boolean, end: Boolean }, forLocales: { <locale>: Boolean } }
const symbolOverrides = {
  MYR: { location: { start: true }, forLocales: { en: true } },
  SGD: { location: { start: true }, forLocales: { en: true } },
  BTC: { location: { start: true }, forLocales: { en: true } },
  ETH: { location: { start: true }, forLocales: { en: true } }
};

const formatCurrencyOverride = function(formattedCurrency, locale = "en") {
  // If currency code remains in front
  const currencyCodeFrontMatch = formattedCurrency.match(/^[A-Z]{3}/);
  if (currencyCodeFrontMatch != null) {
    const code = currencyCodeFrontMatch[0];

    // Replace currency code with symbol if whitelisted.
    const overrideObj = symbolOverrides[code];
    if (overrideObj && overrideObj.location.start && overrideObj.forLocales[locale]) {
      return formattedCurrency.replace(code, currencySymbols[code]);
    } else {
      return formattedCurrency;
    }
  }

  // If currency code is at the back
  const currencyCodeBackMatch = formattedCurrency.match(/[A-Z]{3}$/);
  if (currencyCodeBackMatch != null) {
    // Replace currency code with symbol if whitelisted.
    const code = currencyCodeBackMatch[0];
    if (overrideObj && overrideObj.location.end && overrideObj.forLocales[locale]) {
      return formattedCurrency.replace(code, currencySymbols[code]);
    } else {
      return formattedCurrency;
    }
  }

  return formattedCurrency;
};

export const formatCurrency = (amount, isoCode, raw = false, locale = "en") => {
  isoCode = isoCode.toUpperCase();

  if (window.currentISOCode !== isoCode) {
    window.currentISOCode = isoCode;
    window.currencyFormatterNormal = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: isoCode,
      currencyDisplay: "symbol"
    });
    window.currencyFormatterNoDecimal = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: isoCode,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    window.currencyFormatterMedium = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: isoCode,
      currencyDisplay: "symbol",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
    window.currencyFormatterSmall = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: isoCode,
      currencyDisplay: "symbol",
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    });
    window.currencyFormatterVerySmall = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: isoCode,
      currencyDisplay: "symbol",
      minimumFractionDigits: 8,
      maximumFractionDigits: 8
    });
  }

  if (isoCode === "BTC" || isoCode === "ETH") {
    let price = parseFloat(amount);

    if (raw) {
      if (amount === 0.0) {
        return price.toFixed(2);
      }
      return price.toPrecision(8);
    }

    const largeNumCryptoThreshold = 100;
    if (amount === 0.0) {
      return formatCurrencyOverride(window.currencyFormatterNormal.format(amount), locale);
    } else if (price >= largeNumCryptoThreshold) {
      // Large crypto amount, show no decimal value
      return formatCurrencyOverride(window.currencyFormatterNoDecimal.format(amount), locale);
    } else if (price >= 1.0 && price < largeNumCryptoThreshold) {
      // Medium crypto amount, show 3 fraction digits
      return formatCurrencyOverride(window.currencyFormatterMedium.format(amount), locale);
    } else {
      // Crypto amount < 1, show 8 fraction digits
      return formatCurrencyOverride(window.currencyFormatterVerySmall.format(amount), locale);
    }
  } else {
    if (raw) {
      if (amount < 0.001) {
        return amount.toFixed(8);
      } else if (amount < 1.0) {
        return amount.toFixed(6);
      } else {
        return amount.toFixed(2);
      }
    }

    if (amount < 0.001) {
      return formatCurrencyOverride(window.currencyFormatterVerySmall.format(amount), locale);
    } else if (amount < 1.0) {
      return formatCurrencyOverride(window.currencyFormatterSmall.format(amount), locale);
    } else if (amount > 20000) {
      return formatCurrencyOverride(window.currencyFormatterNoDecimal.format(amount), locale);
    } else {
      // Let the formatter do what it seems best. In particular, we should not set any fraction amount for Japanese Yen
      return formatCurrencyOverride(window.currencyFormatterNormal.format(amount), locale);
    }
  }
};
