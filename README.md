# Cryptoformat

[![npm version](https://badge.fury.io/js/%40coingecko%2Fcryptoformat.svg)](https://badge.fury.io/js/%40coingecko%2Fcryptoformat)
[![Build Status](https://travis-ci.org/coingecko/cryptoformat.svg?branch=master)](https://travis-ci.org/coingecko/cryptoformat)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

`cryptoformat` is used by CoinGecko (<https://www.coingecko.com>) to format crypto and fiat values.

Often an altcoin can be worth much less than \$0.01 USD, and thus we need to format this value by providing more decimal places in the formatting to prevent losing precious information.

`cryptoformat` also tries to handle different locales and currency formatting by deferring the work to the browser's [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat). If `Intl.NumberFormat` is not supported by the browser, `cryptoformat` provides a primitive fallback for currency display.

## Install

```
npm i @coingecko/cryptoformat
```

## Usage

```js
import { formatCurrency } from "@coingecko/cryptoformat";

formatCurrency(123, "USD", "en");
// "$123.00"

formatCurrency(0.00123, "USD", "en");
// "$0.00123000"

// Provide raw = true to remove formatting and symbol
formatCurrency(0.00123, "USD", "en", true);
// "0.00123000"

formatCurrency(123400, "IDR", "id");
// "Rp123.400"

formatCurrency(123400, "EUR", "de");
// "123.400 €"

// Provide noDecimal = true to explicitly remove decimal for numbers above > 1.0
formatCurrency(4000.23, "USD", "en", false, true);
// "$4,000"

// Provide number of decimal places or significant figures
formatCurrency(1.234, "USD", "en", false, { decimalPlaces: 2 });
// "$1.23"

formatCurrency(1234, "USD", "en", false, { significantFigures: 2 });
// "$1,200"

// Provide number of significant figures only up to specified number of decimal places 
formatCurrency(0.1234, "USD", "en", false, { decimalPlaces: 2, significantFigures: 3 });
// "$0.12"

```

`cryptoformat` tries to cache formatters for reuse internally. If same locale and currency is used, the cached formatter will be used.

## Known Issues

1.  `Intl.NumberFormat` does not always behave consistently across browsers. `cryptoformat` does some manual overrides in order to ensure that "MYR123.00" is displayed as "RM123.00", for example.
2.  Given that country detection for locale is quite hard to do, e.g. "en-MY", `cryptoformat` does not try to do country sniffing. It is the responsibility of the caller to provide that if possible, but providing only "en" should also work for the most part, but not perfectly: users in different regions may expect a different formatting for the same language.

## Development

### Deployment

```
npm run build && npm run submit
```

### File Sturcture

```
|- lib
    |- index.js (Build with babel)
|- src
    - index.js (Main Code)
    - index.d.ts (Types for TypeScript)
    - test.js (Test with Jest)
```
