// A map of supported currency codes to currency symbols.
const supportedCurrencySymbols = {
  BTC: "₿",
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
  MXN: "MX$",
  PHP: "₱",
  DKK: "kr.",
  PLN: "zł",
  AED: "DH",
  ARS: "$",
  CLP: "CLP",
  CZK: "Kč",
  HUF: "Ft",
  ILS: "₪",
  KWD: "KD",
  LKR: "Rs",
  NOK: "kr",
  PKR: "₨",
  SAR: "SR",
  THB: "฿",
  TRY: "₺",
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
  PHP: { location: { start: true }, forLocales: { en: true } },
  BTC: { location: { start: true }, forLocales: { en: true } },
  ETH: { location: { start: true }, forLocales: { en: true } }
};

// Feature detection for Intl.NumberFormat
function IntlNumberFormatSupported() {
  return !!(
    typeof Intl == "object" &&
    Intl &&
    typeof Intl.NumberFormat == "function"
  );
}

function isBTCETH(isoCode) {
  return isoCode === "BTC" || isoCode === "ETH";
}

export function isCrypto(isoCode) {
  return isBTCETH(isoCode) || supportedCurrencySymbols[isoCode] == null;
}

// Function to transform the output from Intl.NumberFormat#format
function formatCurrencyOverride(formattedCurrency, locale = "en") {
  // If currency code remains in front
  const currencyCodeFrontMatch = formattedCurrency.match(/^[A-Z]{3}\s?/);
  if (currencyCodeFrontMatch != null) {
    const code = currencyCodeFrontMatch[0].trim(); // trim possible trailing space

    // Replace currency code with symbol if whitelisted.
    const overrideObj = symbolOverrides[code];
    if (
      overrideObj &&
      overrideObj.location.start &&
      overrideObj.forLocales[locale]
    ) {
      return formattedCurrency.replace(
        currencyCodeFrontMatch[0],
        supportedCurrencySymbols[code]
      );
    } else {
      return formattedCurrency;
    }
  }

  // If currency code is at the back
  const currencyCodeBackMatch = formattedCurrency.match(/[A-Z]{3}$/);
  if (currencyCodeBackMatch != null) {
    const code = currencyCodeBackMatch[0];

    // Replace currency code with symbol if whitelisted.
    const overrideObj = symbolOverrides[code];
    if (
      overrideObj &&
      overrideObj.location.end &&
      overrideObj.forLocales[locale]
    ) {
      return formattedCurrency.replace(code, supportedCurrencySymbols[code]);
    } else {
      return formattedCurrency;
    }
  }

  return formattedCurrency;
}

// Generates a formatter from Intl.NumberFormat
function generateIntlNumberFormatter(isoCode, locale, numDecimals) {
  let formatter;
  try {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: isoCode,
      currencyDisplay: "symbol",
      minimumFractionDigits: numDecimals,
      maximumFractionDigits: numDecimals
    });
  } catch (e) {
    // Unsupported currency, etc.
    // Use primitive fallback
    return generateFallbackFormatter(isoCode, locale, numDecimals);
  }
  return formatter;
}

// Generates a primitive fallback formatter with no symbol support.
function generateFallbackFormatter(isoCode, locale, numDecimals = 2) {
  isoCode = isoCode.toUpperCase();

  if (numDecimals > 2) {
    return {
      format: value => {
        return isCrypto(isoCode)
          ? `${value.toFixed(numDecimals)} ${isoCode}`
          : `${isoCode} ${value.toFixed(numDecimals)}`;
      }
    };
  } else {
    return {
      format: value => {
        return isCrypto(isoCode)
          ? `${value.toLocaleString(locale)} ${isoCode}`
          : `${isoCode} ${value.toLocaleString(locale)}`;
      }
    };
  }
}

function generateFormatter(isoCode, locale, numDecimals) {
  const isNumberFormatSupported = IntlNumberFormatSupported();

  const useIntlNumberFormatter =
    isNumberFormatSupported && (!isCrypto(isoCode) || isBTCETH(isoCode));
  return useIntlNumberFormatter
    ? generateIntlNumberFormatter(isoCode, locale, numDecimals)
    : generateFallbackFormatter(isoCode, locale, numDecimals);
}

// State variables
let currentISOCode;
let currentLocale;
let currencyFormatterNormal;
let currencyFormatterNoDecimal;
let currencyFormatterMedium;
let currencyFormatterSmall;
let currencyFormatterVerySmall;

// If a page has to display multiple currencies, formatters would have to be created for each of them
// To save some effort, we save formatters for reuse
let formattersCache = {};

export function clearCache() {
  formattersCache = {};
}

function initializeFormatters(isoCode, locale) {
  const cacheKey = `${isoCode}-${locale}`;
  const cachedFormatter = formattersCache[cacheKey];

  currencyFormatterNormal = cachedFormatter
    ? cachedFormatter.currencyFormatterNormal
    : generateFormatter(isoCode, locale);
  currencyFormatterNoDecimal = cachedFormatter
    ? cachedFormatter.currencyFormatterNoDecimal
    : generateFormatter(isoCode, locale, 0);
  currencyFormatterMedium = cachedFormatter
    ? cachedFormatter.currencyFormatterMedium
    : generateFormatter(isoCode, locale, 3);
  currencyFormatterSmall = cachedFormatter
    ? cachedFormatter.currencyFormatterSmall
    : generateFormatter(isoCode, locale, 6);
  currencyFormatterVerySmall = cachedFormatter
    ? cachedFormatter.currencyFormatterVerySmall
    : generateFormatter(isoCode, locale, 8);

  // Save in cache
  if (cachedFormatter == null) {
    formattersCache[cacheKey] = {};
    formattersCache[cacheKey].currencyFormatterNormal = currencyFormatterNormal;
    formattersCache[
      cacheKey
    ].currencyFormatterNoDecimal = currencyFormatterNoDecimal;
    formattersCache[cacheKey].currencyFormatterMedium = currencyFormatterMedium;
    formattersCache[cacheKey].currencyFormatterSmall = currencyFormatterSmall;
    formattersCache[
      cacheKey
    ].currencyFormatterVerySmall = currencyFormatterVerySmall;
  }
}

// Moderate crypto amount threshold
const MEDIUM_CRYPTO_THRESHOLD = 50;
// Large crypto amount threshold
const LARGE_CRYPTO_THRESHOLD = 1000;

export function formatCurrency(amount, isoCode, locale = "en", raw = false) {
  isoCode = isoCode.toUpperCase();

  if (currentISOCode !== isoCode || currentLocale != locale) {
    currentISOCode = isoCode;
    currentLocale = locale;

    // Formatters are tied to currency code, we try to initialize as infrequently as possible.
    initializeFormatters(isoCode, locale);
  }

  if (isCrypto(isoCode)) {
    let price = parseFloat(amount);

    if (raw) {
      if (amount === 0.0) {
        return price.toFixed(2);
      }
      return price.toPrecision(8);
    }

    if (amount === 0.0) {
      return formatCurrencyOverride(
        currencyFormatterNormal.format(amount),
        locale
      );
    } else if (price >= LARGE_CRYPTO_THRESHOLD) {
      // Large crypto amount, show no decimal value
      return formatCurrencyOverride(
        currencyFormatterNoDecimal.format(amount),
        locale
      );
    } else if (
      price >= MEDIUM_CRYPTO_THRESHOLD &&
      price < LARGE_CRYPTO_THRESHOLD
    ) {
      // Medium crypto amount, show 3 fraction digits
      return formatCurrencyOverride(
        currencyFormatterMedium.format(amount),
        locale
      );
    } else if (price >= 1.0 && price < MEDIUM_CRYPTO_THRESHOLD) {
      //  crypto amount, show 6 fraction digits
      return formatCurrencyOverride(
        currencyFormatterSmall.format(amount),
        locale
      );
    } else {
      // Crypto amount < 1, show 8 fraction digits
      return formatCurrencyOverride(
        currencyFormatterVerySmall.format(amount),
        locale
      );
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

    if (amount === 0.0) {
      return formatCurrencyOverride(
        currencyFormatterNormal.format(amount),
        locale
      );
    } else if (amount < 0.05) {
      return formatCurrencyOverride(
        currencyFormatterVerySmall.format(amount),
        locale
      );
    } else if (amount < 1.0) {
      return formatCurrencyOverride(
        currencyFormatterSmall.format(amount),
        locale
      );
    } else if (amount > 20000) {
      return formatCurrencyOverride(
        currencyFormatterNoDecimal.format(amount),
        locale
      );
    } else {
      // Let the formatter do what it seems best. In particular, we should not set any fraction amount for Japanese Yen
      return formatCurrencyOverride(
        currencyFormatterNormal.format(amount),
        locale
      );
    }
  }
}

export function formatCurrencyWithNames(amount, isoCode, locale = "en") {
  isoCode = isoCode.toUpperCase();
  if (currentISOCode !== isoCode || currentLocale != locale) {
    currentISOCode = isoCode;
    currentLocale = locale;

    // Formatters are tied to currency code, we try to initialize as infrequently as possible.
    initializeFormatters(isoCode, locale);
  }

  const absPrice = Math.abs(Number(amount));
  let price = 0;
  let suffix = "";
  if (absPrice >= 1.0e9) {
    // If Billion
    price = absPrice / 1.0e9;
    suffix = "B";
  } else if (abs >= 1.0e6) {
    // If Million
    price = absPrice / 1.0e6;
    suffix = "M";
  } else if (absPrice >= 1.0e3) {
    // If Thousands
    price = absPrice / 1.0e3;
    suffix = "K";
  }
  if (isCrypto(isoCode)) {
    price = Number(price.toFixed(3));
    return `${price}${suffix} ${isoCode}`;
  } else {
    return formatCurrency(price, isoCode, locale, false) + suffix;
  }
}
