// ─── Currency Utilities ───────────────────────────────────────────────────────
// All monetary values are stored as integer PAISE (₹1 = 100 paise)
// to avoid floating-point precision issues.

/** Format paise as Indian Rupee string: ₹1,23,456 */
export function formatCurrency(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/** Format paise as plain rupee number string (no symbol) */
export function formatAmount(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/** Convert rupee string/number from user input to paise integer */
export function rupeesToPaise(rupees: number | string): number {
  const val = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(val) || val < 0) return 0;
  return Math.round(val * 100);
}

/** Convert paise to rupees for display in input fields */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Format percentage */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
