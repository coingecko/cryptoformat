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

      // Very small cyrpto, 8 decimals
      expect(formatCurrency(0.5, "BTC", "en")).toBe("₿0.50000000");

      // Non-BTC or ETH
      expect(formatCurrency(1.1, "DOGE", "en")).toBe("1.100000 DOGE");
      expect(formatCurrency(1.1, "LTC", "en")).toBe("1.100000 LTC");
    });
  });

  describe("noDecimal = true", () => {
    test("returns without decimal", () => {
      expect(formatCurrency(1001.4543, "BTC", "en", false, true)).toBe("₿1,001");
      expect(formatCurrency(51.12342, "BTC", "en", false, true)).toBe("₿51");
      expect(formatCurrency(11.1432, "BTC", "en", false, true)).toBe("₿11");
      expect(formatCurrency(9.234, "ETH", "en", false, true)).toBe("Ξ9");
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

      // Very small fiat, 8 decimals
      expect(formatCurrency(0.00002, "USD", "en")).toBe("$0.00002000");

      // Negative Fiat, 2 decimals
      expect(formatCurrency(-0.50, "USD", "en")).toBe("-$0.50");

      // Small fiat, 6 decimals
      expect(formatCurrency(0.5, "USD", "en")).toBe("$0.500000");

      // Medium fiat, normal decimals
      expect(formatCurrency(1001, "USD", "en")).toBe("$1,001.00");

      // Large fiat, no decimals
      expect(formatCurrency(51100, "USD", "en")).toBe("$51,100");
    });
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
