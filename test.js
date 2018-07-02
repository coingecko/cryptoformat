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
