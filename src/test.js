import {
  formatCurrency,
  isCrypto,
  clearCache,
  formatCurrencyWithNames
} from "./index";

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

      // Very small cyrpto, 8 decimals
      expect(formatCurrency(0.5, "BTC", "en")).toBe("₿0.50000000");

      // Non-BTC or ETH
      expect(formatCurrency(1.1, "DOGE", "en")).toBe("1.100000 DOGE");
      expect(formatCurrency(1.1, "LTC", "en")).toBe("1.100000 LTC");
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

      // Very small fiat, 8 decimals
      expect(formatCurrency(0.00002, "USD", "en")).toBe("$0.00002000");

      // Small fiat, 6 decimals
      expect(formatCurrency(0.5, "USD", "en")).toBe("$0.500000");

      // Medium fiat, normal decimals
      expect(formatCurrency(1001, "USD", "en")).toBe("$1,001.00");

      // Large fiat, no decimals
      expect(formatCurrency(51100, "USD", "en")).toBe("$51,100");
    });
  });
});

describe("Intl.NumberFormat not supported", () => {
  beforeAll(() => {
    Intl.NumberFormat = null;
    clearCache();
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

        // Non-BTC or ETH
        expect(formatCurrency(1.1, "DOGE", "en")).toBe("1.100000 DOGE");
        expect(formatCurrency(1.1, "LTC", "en")).toBe("1.100000 LTC");
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
        expect(formatCurrency(0.0, "USD", "en")).toBe("USD 0");

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

describe("large number", () => {
  describe("Billion", () => {
    const billionVal1 = 9.101222e9;
    const billionResVal1 = "9.101B";
    const billionVal2 = 9e9;
    const billionResVal2 = "9B";

    test("format USD", () => {
      expect(formatCurrencyWithNames(billionVal1, "USD", "en")).toEqual(
        "USD " + billionResVal1
      );
    });

    test("format BTC", () => {
      expect(formatCurrencyWithNames(billionVal2, "BTC", "en")).toEqual(
        billionResVal2 + " BTC"
      );
    });
  });
});
