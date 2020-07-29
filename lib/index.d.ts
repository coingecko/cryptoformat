export function IntlNumberFormatSupported(): boolean;

export function isCrypto(isoCode: string): boolean;

export function clearCache(): void;

// format currency
export function formatCurrency(amount: number, isoCode: string): string;
export function formatCurrency(
  amount: number,
  isoCode: string,
  locale: string
): string;
export function formatCurrency(
  amount: number,
  isoCode: string,
  locale: string,
  raw: false
): string;
export function formatCurrency(
  amount: number,
  isoCode: string,
  locale: string,
  raw: true
): number;
export function formatCurrency(
  amount: number,
  isoCode: string,
  locale: string,
  raw: true,
  noDecimal: boolean
): number;

// format large value currency
export function formatLargeValueCurrency(
  amount: number,
  isoCode: string,
  locale?: string
): string;
