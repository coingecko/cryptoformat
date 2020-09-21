(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.cryptoformat = {}));
}(this, function (exports) { 'use strict';

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

  function isCrypto(isoCode) {
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

  // If a page has to display multiple currencies, formatters would have to be created for each of them
  // To save some effort, we save formatters for reuse
  let formattersCache = {};

  function clearCache() {
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

    // Save in cache
    if (cachedFormatter == null) {
      formattersCache[cacheKey] = {};
      formattersCache[cacheKey].currencyFormatterNormal = currencyFormatterNormal;
      formattersCache[
        cacheKey
      ].currencyFormatterNoDecimal = currencyFormatterNoDecimal;
      formattersCache[cacheKey].currencyFormatterMedium = currencyFormatterMedium;
      formattersCache[
        cacheKey
      ].currencyFormatterTwoDecimal = currencyFormatterTwoDecimal;
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
  // No decimal threshold for large amounts
  const NO_DECIMAL_THRESHOLD = 100000;

  function formatCurrency(
    amount,
    isoCode,
    locale = "en",
    raw = false,
    noDecimal = false
  ) {
    isoCode = isoCode.toUpperCase();

    if (currentISOCode !== isoCode || currentLocale != locale) {
      currentISOCode = isoCode;
      currentLocale = locale;

      // Formatters are tied to currency code, we try to initialize as infrequently as possible.
      initializeFormatters(isoCode, locale);
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
      } else if (
        noDecimal.hasOwnProperty("decimalPlaces") &&
        noDecimal.hasOwnProperty("significantFigures")
      ) {
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
          locale
        );
      } else {
        const currencyFormatterCustom = generateFormatter(
          isoCode,
          locale,
          noDecimal.decimalPlaces,
          noDecimal.significantFigures
        );

        return formatCurrencyOverride(
          currencyFormatterCustom.format(amount),
          locale
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
      const unsigned_amount = Math.abs(amount);
      if (raw) {
        if (unsigned_amount < 0.001) {
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
          locale
        );
      } else if (unsigned_amount < 0.05) {
        return formatCurrencyOverride(
          currencyFormatterVerySmall.format(amount),
          locale
        );
      } else if (unsigned_amount < 1.0) {
        return formatCurrencyOverride(
          currencyFormatterSmall.format(amount),
          locale
        );
      } else if (isoCode === "JPY" && unsigned_amount < 100) {
        return formatCurrencyOverride(
          currencyFormatterTwoDecimal.format(amount),
          locale
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

  exports.clearCache = clearCache;
  exports.formatCurrency = formatCurrency;
  exports.isCrypto = isCrypto;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
