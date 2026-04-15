export function formatINR(value: number | undefined | null): string {
  if (value == null) return '₹0';
  return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatPercent(value: number | undefined | null): string {
  if (value == null) return '0%';
  return value.toFixed(2) + '%';
}
