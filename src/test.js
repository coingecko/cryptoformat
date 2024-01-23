import { formatCurrency, isCrypto, clearCache } from "./index";

test("isCrypto", () => {
  expect(isCrypto("BTC")).toBe(true);
  expect(isCrypto("DOGE")).toBe(true);
  expect(isCrypto("USD")).toBe(false);
  expect(isCrypto("IDR")).toBe(false);
});

describe("is crypto", () => {
  describe("raw = true", () => {
    test("returns precision of 8", () => {
      expect(formatCurrency(0.00001, "BTC", "en", true)).toBe("0.000010000000");
      expect(formatCurrency(0.00001, "DOGE", "en", true)).toBe(
        "0.000010000000"
      );
    });
  });

  describe("raw = false", () => {
    test("returns formatted", () => {
      expect(formatCurrency(0.0, "BTC", "en")).toBe("₿0.00");

      // Large cyrpto, no decimals
      expect(formatCurrency(1001, "BTC", "en")).toBe("₿1,001");

      // Medium cyrpto, 3 decimals
      expect(formatCurrency(51.1, "BTC", "en")).toBe("₿51.100");

      // Small cyrpto, 6 decimals
      expect(formatCurrency(11.1, "BTC", "en")).toBe("₿11.100000");
      expect(formatCurrency(9.234, "ETH", "en")).toBe("Ξ9.234000");

      // Very small crypto, 8 decimals
      expect(formatCurrency(0.5, "BTC", "en")).toBe("₿0.50000000");

      // VeryVery small crypto, 12 decimals
      expect(formatCurrency(0.0000005, "BTC", "en")).toBe("₿0.000000500000");

      // < 10**-9, 15 decimals
      expect(formatCurrency(10**-10, "BTC", "en")).toBe("₿0.000000000100000");

      // < 10**-12, 18 decimals
      expect(formatCurrency(10**-13, "BTC", "en")).toBe("₿0.000000000000100000");

      // Non-BTC or ETH
      expect(formatCurrency(1.1, "DOGE", "en")).toBe("1.100000 DOGE");
      expect(formatCurrency(1.1, "LTC", "en")).toBe("1.100000 LTC");
    });
  });

  describe("noDecimal = true", () => {
    test("returns without decimal", () => {
      expect(formatCurrency(1001.4543, "BTC", "en", false, true)).toBe("₿1,001");
      expect(formatCurrency(51.12342, "BTC", "en", false, true)).toBe("₿51.123");
      expect(formatCurrency(11.1432, "BTC", "en", false, true)).toBe("₿11.143200");
      expect(formatCurrency(9.234, "ETH", "en", false, true)).toBe("Ξ9.234000");
    });

    test("returns decimal when less than 1", () => {
      expect(formatCurrency(0.0, "BTC", "en", false, true)).toBe("₿0.00");
      expect(formatCurrency(0.5, "BTC", "en", false, true)).toBe("₿0.50000000");
    })
  });

  describe("abbreviated = true", () => {
    test("returns abbreviated format (EN)", () => {
      expect(formatCurrency(12311111, "BTC", "en", false, false, true)).toBe("₿12.311M");
      expect(formatCurrency(1000000000, "BTC", "en", false, false, true)).toBe("₿1B");
      expect(formatCurrency(10000000, "ETH", "en", false, false, true)).toBe("Ξ10M");
      expect(formatCurrency(100000000, "ETH", "en", false, false, true)).toBe("Ξ100M");
      expect(formatCurrency(10000000, "DOGE", "en", false, false, true)).toBe("10M DOGE");
      expect(formatCurrency(100000000, "DOGE", "en", false, false, true)).toBe("100M DOGE");
    });

    test("returns abbreviated format (JA)", () => {
      expect(formatCurrency(12311111, "BTC", "ja", false, false, true)).toBe("BTC 1231.111万");
      expect(formatCurrency(1000000000, "BTC", "ja", false, false, true)).toBe("BTC 10億");
      expect(formatCurrency(10000000, "ETH", "ja", false, false, true)).toBe("ETH 1000万");
      expect(formatCurrency(100000000, "ETH", "ja", false, false, true)).toBe("ETH 1億");
      expect(formatCurrency(10000000, "DOGE", "ja", false, false, true)).toBe("1000万 DOGE");
      expect(formatCurrency(100000000, "DOGE", "ja", false, false, true)).toBe("1億 DOGE");
    });
  });
});

describe("is fiat", () => {
  describe("raw = true", () => {
    test("returns formatted raw", () => {
      // Very small fiat, 8 decimals
      expect(formatCurrency(0.00001, "USD", "en", true)).toBe("0.00001000");

      // Small fiat, 6 decimals
      expect(formatCurrency(0.5, "USD", "en", true)).toBe("0.500000");

      // Normal fiat, 2 decimals
      expect(formatCurrency(10, "USD", "en", true)).toBe("10.00");
    });
  });

  describe("raw = false", () => {
    test("returns formatted with symbol", () => {
      // 0 fiat, no decimals
      expect(formatCurrency(0.0, "USD", "en")).toBe("$0.00");

      // VeryVery small fiat, 12 decimals
      expect(formatCurrency(0.0000002, "USD", "en")).toBe("$0.000000200000");

      // Very small fiat, 8 decimals
      expect(formatCurrency(0.00002, "USD", "en")).toBe("$0.00002000");

      // Negative Fiat, 18 decimals, if less than 0.0000000000001
      expect(formatCurrency(-0.00000000000004, "USD", "en")).toBe("-$0.000000000000040000");

      // Negative Fiat, 15 decimals, if less than 0.0000000001
      expect(formatCurrency(-0.00000000004, "USD", "en")).toBe("-$0.000000000040000");

      // Negative Fiat, 12 decimals, if less than 0.000001
      expect(formatCurrency(-0.0000004, "USD", "en")).toBe("-$0.000000400000");

      // Negative Fiat, 8 decimals, if less than 0.05
      expect(formatCurrency(-0.04, "USD", "en")).toBe("-$0.04000000");

      // Negative Fiat, 6 decimals, if less than 1
      expect(formatCurrency(-0.50, "USD", "en")).toBe("-$0.500000");

      // Negative Fiat, 2 decimals
      expect(formatCurrency(-1.50, "USD", "en")).toBe("-$1.50");

      // Small fiat, 6 decimals
      expect(formatCurrency(0.5, "USD", "en")).toBe("$0.500000");

      // Medium fiat, normal decimals
      expect(formatCurrency(1001, "USD", "en")).toBe("$1,001.00");

      // Large fiat, no decimals
      expect(formatCurrency(51100, "USD", "en")).toBe("$51,100.00");
    });
  });

  describe("no decimal threshold", () => {
    test("returns decimal for amounts <= 100,000", () => {
      expect(formatCurrency(4000.23, "USD", "en")).toBe("$4,000.23");
      expect(formatCurrency(100000, "USD", "en")).toBe("$100,000.00");
    });

    test("returns no decimal for amounts > 100,000", () => {
      expect(formatCurrency(250000.9, "USD", "en")).toBe("$250,001");
      expect(formatCurrency(100000.001, "USD", "en")).toBe("$100,000");
    })
  });

  describe("noDecimal = true", () => {
    test("returns without decimal", () => {
      expect(formatCurrency(4000.23, "USD", "en", false, true)).toBe("$4,000");
      expect(formatCurrency(1001.58, "USD", "en", false, true)).toBe("$1,002");
      expect(formatCurrency(51100.3, "USD", "en", false, true)).toBe("$51,100");
    });

    test("returns decimal when less than 1", () => {
      expect(formatCurrency(0.0, "USD", "en", false, true)).toBe("$0.00");
      expect(formatCurrency(0.5, "USD", "en", false, true)).toBe("$0.500000");
      expect(formatCurrency(0.00002, "USD", "en", false, true)).toBe("$0.00002000");
    })
  });

  describe("abbreviated = true", () => {
    test("returns abbreviated format (EN)", () => {
      expect(formatCurrency(10200000, "USD", "en", false, false, true)).toBe("$10.2M");
      expect(formatCurrency(12100000000, "USD", "en", false, false, true)).toBe("$12.1B");
      expect(formatCurrency(10000000, "AUD", "en", false, false, true)).toBe("A$10M");
      expect(formatCurrency(100000000, "AUD", "en", false, false, true)).toBe("A$100M");
      expect(formatCurrency(10000000, "JPY", "en", false, false, true)).toBe("¥10M");
      expect(formatCurrency(100000000, "JPY", "en", false, false, true)).toBe("¥100M");
    });

    test("returns abbreviated format (JA)", () => {
      expect(formatCurrency(12000000, "USD", "ja", false, false, true)).toBe("$1200万");
      expect(formatCurrency(1210000000, "USD", "ja", false, false, true)).toBe("$12.1億");
      expect(formatCurrency(10000000, "AUD", "ja", false, false, true)).toBe("A$1000万");
      expect(formatCurrency(100000000, "AUD", "ja", false, false, true)).toBe("A$1億");
      expect(formatCurrency(10000000, "JPY", "ja", false, false, true)).toBe("￥1000万");
      expect(formatCurrency(100000000, "JPY", "ja", false, false, true)).toBe("￥1億");
    });
  });
});

describe("Intl.NumberFormat not supported", () => {
  let temp = Intl.NumberFormat;

  beforeAll(() => {
    Intl.NumberFormat = null;
    clearCache();
  });

  afterAll(() => {
    Intl.NumberFormat = temp;
  });

  describe("is BTC or ETH", () => {
    describe("raw = true", () => {
      test("returns precision of 8", () => {
        expect(formatCurrency(0.00001, "BTC", "en", true)).toBe(
          "0.000010000000"
        );
      });
    });

    describe("raw = false", () => {
      test("returns currency with ISO Code", () => {
        expect(formatCurrency(0.0, "BTC", "en")).toBe("0 BTC");

        // Large cyrpto, no decimals
        expect(formatCurrency(1001, "BTC", "en")).toBe("1,001 BTC");

        // Medium cyrpto, 3 decimals
        expect(formatCurrency(51.1, "BTC", "en")).toBe("51.100 BTC");

        // Small cyrpto, 6 decimals
        expect(formatCurrency(11.1, "BTC", "en")).toBe("11.100000 BTC");
        expect(formatCurrency(9.234, "ETH", "en")).toBe("9.234000 ETH");

        // Very small cyrpto, 8 decimals
        expect(formatCurrency(0.5, "BTC", "en")).toBe("0.50000000 BTC");

        // VeryVery small cyrpto, 12 decimals
        expect(formatCurrency(0.0000005, "BTC", "en")).toBe("0.000000500000 BTC");

        // < 0.000000001 crypto, 15 decimals
        expect(formatCurrency(0.00000000005, "BTC", "en")).toBe("0.000000000050000 BTC");

        // < 0.000000000001 crypto, 18 decimals
        expect(formatCurrency(0.00000000000005, "BTC", "en")).toBe("0.000000000000050000 BTC");

        // Non-BTC or ETH
        expect(formatCurrency(1.1, "DOGE", "en")).toBe("1.100000 DOGE");
        expect(formatCurrency(1.1, "LTC", "en")).toBe("1.100000 LTC");
      });
    });
  });

  describe("is fiat", () => {
    describe("raw = true", () => {
      test("returns formatted raw", () => {
        // < 0.00000001 fiat, 18 decimals
        expect(formatCurrency(0.00000000000001, "USD", "en", true)).toBe("0.000000000000010000");

        // < 0.00000001 fiat, 15 decimals
        expect(formatCurrency(0.00000000001, "USD", "en", true)).toBe("0.000000000010000");

        // VeryVery small fiat, 12 decimals
        expect(formatCurrency(0.0000001, "USD", "en", true)).toBe("0.000000100000");

        // Very small fiat, 8 decimals
        expect(formatCurrency(0.00001, "USD", "en", true)).toBe("0.00001000");

        // Small fiat, 6 decimals
        expect(formatCurrency(0.5, "USD", "en", true)).toBe("0.500000");

        // Normal fiat, 2 decimals
        expect(formatCurrency(10, "USD", "en", true)).toBe("10.00");
      });
    });

    describe("raw = false", () => {
      test("returns formatted with symbol", () => {
        // 0 fiat, no decimals
        expect(formatCurrency(0.0, "USD", "en")).toBe("USD 0");

        // < 0.000000001 fiat, 15 decimals
        expect(formatCurrency(0.00000000000001, "USD", "en")).toBe("USD 0.000000000000010000");

        // < 0.000000001 fiat, 15 decimals
        expect(formatCurrency(0.00000000001, "USD", "en")).toBe("USD 0.000000000010000");

        // Very small fiat, 12 decimals
        expect(formatCurrency(0.0000002, "USD", "en")).toBe("USD 0.000000200000");

        // Very small fiat, 8 decimals
        expect(formatCurrency(0.00002, "USD", "en")).toBe("USD 0.00002000");

        // Small fiat, 6 decimals
        expect(formatCurrency(0.5, "USD", "en")).toBe("USD 0.500000");

        // Medium fiat, normal decimals
        expect(formatCurrency(1001, "USD", "en")).toBe("USD 1,001");

        // Large fiat, no decimals
        expect(formatCurrency(51100, "USD", "en")).toBe("USD 51,100");
      });
    });
  });
});

describe("Format Currency correctly", () => {
  beforeAll(() => {
    clearCache();
  });

  // https://github.com/coingecko/cryptoformat/issues/18
  it("formats JPY correctly", () => {
    expect(formatCurrency(123400, "JPY", "en")).toEqual("¥123,400");
    expect(formatCurrency(32.034, "JPY", "en")).toEqual("¥32.03");
  });
});

describe("Accepts object parameter", () => {
  beforeAll(() => {
    clearCache();
  });

  it("defaults to noDecimal = false", () => {
    expect(formatCurrency(1005.1005, "USD", "en", false, {})).toEqual("$1,005.10");
  })

  it("formats decimal places correctly", () => {
    // Show specified number of decimal places
    expect(formatCurrency(123.456, "USD", "en", false, {decimalPlaces:1})).toEqual("$123.5");
    expect(formatCurrency(1000.12345, "USD", "en", false, {decimalPlaces: 3})).toEqual("$1,000.123");
    expect(formatCurrency(0.19, "BTC", "en", false, {decimalPlaces: 5})).toEqual("₿0.19000");
  });

  it("formats significant figures correctly", () => {
    // Round off to max n significant figures
    expect(formatCurrency(12311.456, "USD", "en", false, {significantFigures: 1})).toEqual("$10,000");
    expect(formatCurrency(0.99999, "USD", "en", false, {significantFigures: 2})).toEqual("$1");
    expect(formatCurrency(1000.12345, "USD", "en", false, {significantFigures: 5})).toEqual("$1,000.1");
  });

  it("formats decimal trailing zeroes correctly", () => {
    // Round off to max n significant figures
    expect(formatCurrency(0.00, "USD", "en", false, {maximumDecimalTrailingZeroes: 1})).toEqual("$0.0<sub title=\"$0.00\">2</sub>");
    expect(formatCurrency(0.000023948, "USD", "en", false, {maximumDecimalTrailingZeroes: 4})).toEqual("$0.00002395");
    expect(formatCurrency(0.00000000000000003928, "USD", "en", false, {maximumDecimalTrailingZeroes: 3})).toEqual("$0.0<sub title=\"$0.000000000000000039\">16</sub>39");
    // \xa0 is non-breaking space
    expect(formatCurrency(0.000000000008, "USD", "vi", false, {maximumDecimalTrailingZeroes: 3})).toEqual("0,0<sub title=\"0,000000000008000\xa0US$\">11</sub>8000\xa0US$");
  });

  it("formats decimal places, significant figures and decimal trailing zeroes correctly", () => {
    // Round off to max n significant figures, with max n decimal places, and maximum 3 decimal trailing zeroes
    expect(formatCurrency(123.456, "USD", "en", false, {decimalPlaces: 2, significantFigures: 3, maximumDecimalTrailingZeroes: 3})).toEqual("$123");
    expect(formatCurrency(0.00043, "USD", "en", false, {decimalPlaces: 4, significantFigures: 5, maximumDecimalTrailingZeroes: 3})).toEqual("$0.0004");
    expect(formatCurrency(1.000049500005, "USD", "en", false, {decimalPlaces: 7, significantFigures: 8, maximumDecimalTrailingZeroes: 3})).toEqual("$1.0<sub title=\"$1.0000495\">4</sub>495");
    // Handle edge case, should only round once
    expect(formatCurrency(1.94999, "USD", "en", false, {decimalPlaces: 2, significantFigures: 4, maximumDecimalTrailingZeroes: 2})).toEqual("$1.95");

    // Round off to max n significant figures, with max 4 decimal places, and maximum n decimal trailing zeroes
    expect(formatCurrency(0.003422, "USD", "en", false, {decimalPlaces: 4, significantFigures: 3, maximumDecimalTrailingZeroes: 1})).toEqual("$0.0<sub title=\"$0.0034\">2</sub>34");
    expect(formatCurrency(34.0430, "USD", "en", false, {decimalPlaces: 4, significantFigures: 4, maximumDecimalTrailingZeroes: 3})).toEqual("$34.04");
    expect(formatCurrency(0.000495343, "USD", "en", false, {decimalPlaces: 4, significantFigures: 5, maximumDecimalTrailingZeroes: 2})).toEqual("$0.0<sub title=\"$0.0005\">3</sub>5");

    // Round off to max 6 significant figures, with max n decimal places, and maximum n decimal trailing zeroes
    expect(formatCurrency(0.00394756, "USD", "en", false, {decimalPlaces: 2, significantFigures: 6, maximumDecimalTrailingZeroes: 2})).toEqual("$0");
    expect(formatCurrency(12.0430324, "USD", "en", false, {decimalPlaces: 4, significantFigures: 6, maximumDecimalTrailingZeroes: 3})).toEqual("$12.043");
    expect(formatCurrency(0.000495343, "USD", "en", false, {decimalPlaces: 5, significantFigures: 6, maximumDecimalTrailingZeroes: 1})).toEqual("$0.0<sub title=\"$0.0005\">3</sub>5");
  });

  it("raw = true", () => {
    // Round off to specified significant figure only
    expect(formatCurrency(123.456, "USD", "en", true, {significantFigures: 5})).toEqual("123.46");

    // Show up to specified fraction digits only
    expect(formatCurrency(123.456, "USD", "en", true, {decimalPlaces: 0})).toEqual("123");

    // Round off to max n significant figures, with max n decimal places
    expect(formatCurrency(123.456, "USD", "en", true, {decimalPlaces: 8, significantFigures: 5})).toEqual("123.46");
    expect(formatCurrency(123456.78, "USD", "en", true, {decimalPlaces: 1, significantFigures: 10})).toEqual("123456.8");
    // Handle edge case, should only round once
    expect(formatCurrency(1.94999, "USD", "en", true, {decimalPlaces: 2, significantFigures: 2})).toEqual("1.9");
  })
});
