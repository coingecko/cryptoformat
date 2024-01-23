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
  XDR: "XDR",
};

// A map of override objects to apply.
// Format:
// { location: { start: Boolean, end: Boolean }, forLocales: { <locale>: Boolean } }
const symbolOverrides = {
  MYR: { location: { start: true }, forLocales: { en: true } },
  SGD: { location: { start: true }, forLocales: { en: true } },
  PHP: { location: { start: true }, forLocales: { en: true } },
  BTC: { location: { start: true }, forLocales: { en: true } },
  ETH: { location: { start: true }, forLocales: { en: true } },
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

// Function to transform decimal trailing zeroes to exponent
function decimalTrailingZeroesToExponent(formattedCurrency, maximumDecimalTrailingZeroes) {
  const decimalTrailingZeroesPattern = new RegExp(`(\\.|,)(0{${maximumDecimalTrailingZeroes + 1},})(?=[1-9]?)`);

  return formattedCurrency.replace(
      decimalTrailingZeroesPattern,
      (_match, separator, decimalTrailingZeroes) => `${separator}0<sub title=\"${formattedCurrency}\">${decimalTrailingZeroes.length}</sub>`,
  )
}

// Function to transform the output from Intl.NumberFormat#format
function formatCurrencyOverride(formattedCurrency, locale = "en", maximumDecimalTrailingZeroes) {
  if (typeof maximumDecimalTrailingZeroes !== "undefined") {
    formattedCurrency = decimalTrailingZeroesToExponent(formattedCurrency, maximumDecimalTrailingZeroes)
  }

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
function generateIntlNumberFormatter(isoCode, locale, numDecimals, numSigFig) {
  try {
    const params = {
      style: "currency",
      currency: isoCode,
      currencyDisplay: "symbol",
    };
    if (numDecimals !== undefined) {
      params.minimumFractionDigits = numDecimals;
      params.maximumFractionDigits = numDecimals;
    } else if (numSigFig !== undefined) {
      params.maximumSignificantDigits = numSigFig;
    }
    return new Intl.NumberFormat(locale, params);
  } catch (e) {
    // Unsupported currency, etc.
    // Use primitive fallback
    return generateFallbackFormatter(isoCode, locale, numDecimals);
  }
}

// Generates a primitive fallback formatter with no symbol support.
function generateFallbackFormatter(isoCode, locale, numDecimals = 2) {
  isoCode = isoCode.toUpperCase();

  if (numDecimals > 2) {
    return {
      format: (value) => {
        return isCrypto(isoCode)
          ? `${value.toFixed(numDecimals)} ${isoCode}`
          : `${isoCode} ${value.toFixed(numDecimals)}`;
      },
    };
  } else {
    return {
      format: (value) => {
        return isCrypto(isoCode)
          ? `${value.toLocaleString(locale)} ${isoCode}`
          : `${isoCode} ${value.toLocaleString(locale)}`;
      },
    };
  }
}

function generateAbbreviatedFormatter(isoCode, locale) {
  // Show regular numbers if no Intl.NumberFormat support.
  if (!IntlNumberFormatSupported()) {
    return generateFallbackFormatter(isoCode, locale, 0);
  }

  let numberFormatOptions = { style: "decimal", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 3 };

  // Currency symbol is supported if currency is Fiat/BTC/ETH.
  if (!isCrypto(isoCode) || isBTCETH(isoCode)) {
    numberFormatOptions.style = "currency";
    numberFormatOptions.currency = isoCode;
  }

  return new Intl.NumberFormat(locale, numberFormatOptions);
}

function generateFormatter(isoCode, locale, numDecimals, numSigFig) {
  const isNumberFormatSupported = IntlNumberFormatSupported();

  const useIntlNumberFormatter =
    isNumberFormatSupported && (!isCrypto(isoCode) || isBTCETH(isoCode));
  return useIntlNumberFormatter
    ? generateIntlNumberFormatter(isoCode, locale, numDecimals, numSigFig)
    : generateFallbackFormatter(isoCode, locale, numDecimals);
}

// State variables
let currentISOCode;
let currentLocale;
let currencyFormatterNormal;
let currencyFormatterNoDecimal;
let currencyFormatterMedium;
let currencyFormatterTwoDecimal;
let currencyFormatterSmall;
let currencyFormatterVerySmall;
let currencyFormatterVeryVerySmall;
let currencyFormatter15DP;
let currencyFormatter18DP;
let currencyFormatterAbbreviated;

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
  currencyFormatterTwoDecimal = cachedFormatter
    ? cachedFormatter.currencyFormatterTwoDecimal
    : generateFormatter(isoCode, locale, 2);
  currencyFormatterSmall = cachedFormatter
    ? cachedFormatter.currencyFormatterSmall
    : generateFormatter(isoCode, locale, 6);
  currencyFormatterVerySmall = cachedFormatter
    ? cachedFormatter.currencyFormatterVerySmall
    : generateFormatter(isoCode, locale, 8);
  currencyFormatterVeryVerySmall = cachedFormatter
    ? cachedFormatter.currencyFormatterVeryVerySmall
    : generateFormatter(isoCode, locale, 12);
  currencyFormatter15DP = cachedFormatter
    ? cachedFormatter.currencyFormatter15DP
    : generateFormatter(isoCode, locale, 15);
  currencyFormatter18DP = cachedFormatter
    ? cachedFormatter.currencyFormatter18DP
    : generateFormatter(isoCode, locale, 18);
  currencyFormatterAbbreviated = cachedFormatter
    ? cachedFormatter.currencyFormatterAbbreviated
    : generateAbbreviatedFormatter(isoCode, locale);

  // Save in cache
  if (cachedFormatter == null) {
    formattersCache[cacheKey] = {};
    formattersCache[cacheKey].currencyFormatterNormal = currencyFormatterNormal;
    formattersCache[cacheKey].currencyFormatterNoDecimal = currencyFormatterNoDecimal;
    formattersCache[cacheKey].currencyFormatterMedium = currencyFormatterMedium;
    formattersCache[cacheKey].currencyFormatterTwoDecimal = currencyFormatterTwoDecimal;
    formattersCache[cacheKey].currencyFormatterSmall = currencyFormatterSmall;
    formattersCache[cacheKey].currencyFormatterVerySmall = currencyFormatterVerySmall;
    formattersCache[cacheKey].currencyFormatterVeryVerySmall = currencyFormatterVeryVerySmall;
    formattersCache[cacheKey].currencyFormatter15DP = currencyFormatter15DP;
    formattersCache[cacheKey].currencyFormatter18DP = currencyFormatter18DP;
    formattersCache[cacheKey].currencyFormatterAbbreviated = currencyFormatterAbbreviated;
  }
}

// Moderate crypto amount threshold
const MEDIUM_CRYPTO_THRESHOLD = 50;
// Large crypto amount threshold
const LARGE_CRYPTO_THRESHOLD = 1000;
// No decimal threshold for large amounts
const NO_DECIMAL_THRESHOLD = 100000;

export function formatCurrency(
  amount,
  isoCode,
  locale = "en",
  raw = false,
  noDecimal = false,
  abbreviated = false,
) {
  isoCode = isoCode.toUpperCase();
  let maximumDecimalTrailingZeroes = undefined;

  if (currentISOCode !== isoCode || currentLocale != locale) {
    currentISOCode = isoCode;
    currentLocale = locale;

    // Formatters are tied to currency code, we try to initialize as infrequently as possible.
    initializeFormatters(isoCode, locale);
  }

  if (abbreviated) {
    let formattedAbbreviatedCurrency = currencyFormatterAbbreviated.format(amount);

    // Manually add currency code to the back for non-BTC/ETH crypto currencies.
    if (isCrypto(isoCode) && !isBTCETH(isoCode)) {
      formattedAbbreviatedCurrency = `${formattedAbbreviatedCurrency} ${isoCode}`;
    }

    return formatCurrencyOverride(formattedAbbreviatedCurrency, locale);
  }

  if (noDecimal === true && amount > 100.0) {
    return formatCurrencyOverride(
      currencyFormatterNoDecimal.format(amount),
      locale
    );
  } else if (typeof noDecimal === "object" && noDecimal !== null) {
    if (raw) {
      // Limit to max n decimal places if applicable
      let raw_amount = noDecimal.hasOwnProperty("decimalPlaces")
        ? amount.toFixed(noDecimal.decimalPlaces)
        : amount;
      // Round off to number of significant figures without trailing 0's
      return `${parseFloat(raw_amount).toPrecision(noDecimal.significantFigures) / 1}`;
    }

    if (noDecimal.hasOwnProperty("maximumDecimalTrailingZeroes")) {
      maximumDecimalTrailingZeroes = noDecimal.maximumDecimalTrailingZeroes;
    }

    if (noDecimal.hasOwnProperty("decimalPlaces") && noDecimal.hasOwnProperty("significantFigures")) {
      // Show specified number of significant digits with cutoff of specified fraction digits
      const currencyFormatterCustom = generateFormatter(
        isoCode,
        locale,
        undefined,
        noDecimal.significantFigures
      );

      return formatCurrencyOverride(
        currencyFormatterCustom.format(
          Number.parseFloat(amount.toFixed(noDecimal.decimalPlaces))
        ),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (noDecimal.hasOwnProperty("decimalPlaces") || noDecimal.hasOwnProperty("significantFigures")) {
      const currencyFormatterCustom = generateFormatter(
        isoCode,
        locale,
        noDecimal.decimalPlaces,
        noDecimal.significantFigures
      );

      return formatCurrencyOverride(
        currencyFormatterCustom.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    }
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
        locale,
        maximumDecimalTrailingZeroes
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
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (price >= 1.0 && price < MEDIUM_CRYPTO_THRESHOLD) {
      //  crypto amount, show 6 fraction digits
      return formatCurrencyOverride(
        currencyFormatterSmall.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (price >= 0.000001 && price < 1.0) {
      //  crypto amount, show 8 fraction digits
      return formatCurrencyOverride(
        currencyFormatterVerySmall.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (price >= 10**-9 && price < 10**-6) {
      return formatCurrencyOverride(
        currencyFormatterVeryVerySmall.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (price >= 10**-12 && price < 10**-9) {
      return formatCurrencyOverride(
        currencyFormatter15DP.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (price < 10**-12) {
      return formatCurrencyOverride(
        currencyFormatter18DP.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    }
  } else {
    const unsigned_amount = Math.abs(amount);
    if (raw) {
      if (unsigned_amount < 10**-12) {
        return amount.toFixed(18);
      } else if (unsigned_amount < 10**-9) {
        return amount.toFixed(15);
      } else if (unsigned_amount < 10**-6) {
        return amount.toFixed(12);
      } else if (unsigned_amount < 10**-3) {
        return amount.toFixed(8);
      } else if (unsigned_amount < 1.0) {
        return amount.toFixed(6);
      } else {
        return amount.toFixed(2);
      }
    }

    if (unsigned_amount === 0.0) {
      return formatCurrencyOverride(
        currencyFormatterNormal.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (unsigned_amount < 10**-12) {
      return formatCurrencyOverride(
        currencyFormatter18DP.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (unsigned_amount < 10**-9) {
      return formatCurrencyOverride(
        currencyFormatter15DP.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (unsigned_amount < 10**-6) {
      return formatCurrencyOverride(
        currencyFormatterVeryVerySmall.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (unsigned_amount < 0.05) {
      return formatCurrencyOverride(
        currencyFormatterVerySmall.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (unsigned_amount < 1.0) {
      return formatCurrencyOverride(
        currencyFormatterSmall.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (isoCode === "JPY" && unsigned_amount < 100) {
      return formatCurrencyOverride(
        currencyFormatterTwoDecimal.format(amount),
        locale,
        maximumDecimalTrailingZeroes
      );
    } else if (unsigned_amount > NO_DECIMAL_THRESHOLD) {
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
