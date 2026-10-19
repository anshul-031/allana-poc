/**
 * Format numeric value to standard USD currency string.
 * Supports negative deficit amounts (e.g. -$272,796.96 USD).
 */
export function formatUSD(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '$0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNegative = num < 0;
  const absFormatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `-$${absFormatted} USD` : `$${absFormatted}`;
}

/**
 * Format dates to standard export portal formats (default DD.MM.YYYY or DD.MM.YYYY HH:mm:ss)
 */
export function formatDate(
  dateInput: Date | string | number | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (!includeTime) {
    return `${day}.${month}.${year}`;
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format meat export weights in KG with specified decimal precision.
 */
export function formatWeight(
  weightKg: number | string | null | undefined,
  precision = 2,
  includeUnit = true
): string {
  if (weightKg === null || weightKg === undefined || isNaN(Number(weightKg))) {
    return includeUnit ? `0.${'0'.repeat(precision)} KG` : `0.${'0'.repeat(precision)}`;
  }
  const num = typeof weightKg === 'string' ? parseFloat(weightKg) : weightKg;
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return includeUnit ? `${formatted} KG` : formatted;
}

/**
 * Clean ClassName merger utility (dependency-free)
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Calculate Sales Plan Delta between target, shipped, and pipeline orders.
 * Formula: Delta = (Shipped + Pipeline) - Target
 */
export function calculateDelta(
  shipped: number,
  pipeline: number,
  target: number
): { delta: number; isDeficit: boolean; formatted: string } {
  const delta = (shipped + pipeline) - target;
  const isDeficit = delta < 0;
  const sign = delta > 0 ? '+' : '';
  const formatted = `${sign}${delta.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return { delta, isDeficit, formatted };
}
