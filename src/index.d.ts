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
  raw: boolean
): string;
export function formatCurrency(
  amount: number,
  isoCode: string,
  locale: string,
  raw: boolean,
  noDecimal: boolean | decimalConfig
): string;

interface decimalConfig {
  decimalPlaces?: number, 
  significantFigures?: number 
}