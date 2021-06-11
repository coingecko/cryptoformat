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

        // Non-BTC or ETH
        expect(formatCurrency(1.1, "DOGE", "en")).toBe("1.100000 DOGE");
        expect(formatCurrency(1.1, "LTC", "en")).toBe("1.100000 LTC");
      });
    });
  });

  describe("is fiat", () => {
    describe("raw = true", () => {
      test("returns formatted raw", () => {
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

  it("formats decimal places and significant figures correctly", () => {
    // Round off to max n significant figures, with max 2 decimal places
    expect(formatCurrency(123.456, "USD", "en", false, {decimalPlaces: 2, significantFigures: 3})).toEqual("$123");
    expect(formatCurrency(12.345678, "USD", "en", false, {decimalPlaces: 2, significantFigures: 4})).toEqual("$12.35");
    expect(formatCurrency(1005.15, "USD", "en", false, {decimalPlaces: 2, significantFigures: 5})).toEqual("$1,005.2");
    // Handle edge case, should only round once
    expect(formatCurrency(1.94999, "USD", "en", false, {decimalPlaces: 2, significantFigures: 4})).toEqual("$1.95");

    // Round off to max 6 significant figures, with max n decimal places
    expect(formatCurrency(0.00016, "USD", "en", false, {decimalPlaces: 4, significantFigures: 6})).toEqual("$0.0002");
    expect(formatCurrency(1234.56789, "USD", "en", false, {decimalPlaces: 3, significantFigures: 6})).toEqual("$1,234.57");
    expect(formatCurrency(0.000000012345, "BTC", "en", false, {decimalPlaces: 8, significantFigures: 6})).toEqual("₿0.00000001");
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
