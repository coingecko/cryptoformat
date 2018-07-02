import { formatCurrency } from "./index";

describe("is BTC or ETH", () => {
  describe("raw = true", () => {
    test("returns precision of 8", () => {
      expect(formatCurrency(0.00001, "BTC", "en", true)).toBe("0.000010000000");
    });
  });

  describe("raw = false", () => {
    test("returns formatted", () => {
      expect(formatCurrency(0.0, "BTC", "en")).toBe("Ƀ0.00");

      // Large cyrpto, no decimals
      expect(formatCurrency(1001, "BTC", "en")).toBe("Ƀ1,001");

      // Medium cyrpto, 3 decimals
      expect(formatCurrency(51.1, "BTC", "en")).toBe("Ƀ51.100");

      // Small cyrpto, 6 decimals
      expect(formatCurrency(11.1, "BTC", "en")).toBe("Ƀ11.100000");
      expect(formatCurrency(9.234, "ETH", "en")).toBe("Ξ9.234000");

      // Very small cyrpto, 8 decimals
      expect(formatCurrency(0.5, "BTC", "en")).toBe("Ƀ0.50000000");
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
