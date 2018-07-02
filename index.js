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

// Function to transform the output from Intl.NumberFormat#format
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

let currentISOCode;
let currencyFormatterNormal;
let currencyFormatterNoDecimal;
let currencyFormatterMedium;
let currencyFormatterSmall;
let currencyFormatterVerySmall;

function initializeFormatters(isoCode) {
  currencyFormatterNormal = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: isoCode,
    currencyDisplay: "symbol"
  });
  currencyFormatterNoDecimal = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: isoCode,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  currencyFormatterMedium = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: isoCode,
    currencyDisplay: "symbol",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
  currencyFormatterSmall = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: isoCode,
    currencyDisplay: "symbol",
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  });
  currencyFormatterVerySmall = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: isoCode,
    currencyDisplay: "symbol",
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  });
}

export const formatCurrency = (amount, isoCode, raw = false, locale = "en") => {
  isoCode = isoCode.toUpperCase();

  if (currentISOCode !== isoCode) {
    currentISOCode = isoCode;

    // Formatters are tied to currency code, we try to initialize as infrequently as possible.
    initializeFormatters();
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
      return formatCurrencyOverride(currencyFormatterNormal.format(amount), locale);
    } else if (price >= largeNumCryptoThreshold) {
      // Large crypto amount, show no decimal value
      return formatCurrencyOverride(currencyFormatterNoDecimal.format(amount), locale);
    } else if (price >= 1.0 && price < largeNumCryptoThreshold) {
      // Medium crypto amount, show 3 fraction digits
      return formatCurrencyOverride(currencyFormatterMedium.format(amount), locale);
    } else {
      // Crypto amount < 1, show 8 fraction digits
      return formatCurrencyOverride(currencyFormatterVerySmall.format(amount), locale);
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
      return formatCurrencyOverride(currencyFormatterVerySmall.format(amount), locale);
    } else if (amount < 1.0) {
      return formatCurrencyOverride(currencyFormatterSmall.format(amount), locale);
    } else if (amount > 20000) {
      return formatCurrencyOverride(currencyFormatterNoDecimal.format(amount), locale);
    } else {
      // Let the formatter do what it seems best. In particular, we should not set any fraction amount for Japanese Yen
      return formatCurrencyOverride(currencyFormatterNormal.format(amount), locale);
    }
  }
};
