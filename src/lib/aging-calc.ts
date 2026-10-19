/**
 * Accounts Receivables Aging Calculation Engine (FEAT-7.2)
 * Categorizes invoice balances into 5 standard accounting aging brackets:
 * Current, 1-30 Days, 31-60 Days, 61-90 Days, and >90 Days Overdue.
 */

export type AgingBucketType =
  | 'CURRENT'
  | 'DAYS_1_30'
  | 'DAYS_31_60'
  | 'DAYS_61_90'
  | 'OVER_90';

export interface AgingInvoiceItem {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  amountUsd: number;
  paidAmountUsd: number;
  outstandingAmountUsd: number;
  overdueDays: number;
  bucket: AgingBucketType;
}

export interface AgingBucketSummary {
  bucket: AgingBucketType;
  label: string;
  amountUsd: number;
  invoiceCount: number;
  percentage: number; // 0 - 100
}

export interface ReceivablesAgingSchedule {
  asOfDate: string;
  totalReceivablesUsd: number;
  totalOverdueUsd: number;
  overduePercentage: number;
  currentAmountUsd: number;
  days1to30AmountUsd: number;
  days31to60AmountUsd: number;
  days61to90AmountUsd: number;
  over90AmountUsd: number;
  buckets: AgingBucketSummary[];
  invoices: AgingInvoiceItem[];
}

/**
 * Calculates days between two date strings (YYYY-MM-DD or ISO)
 */
export function calculateDaysDifference(targetDate: string, asOfDate: string): number {
  const target = new Date(targetDate);
  const asOf = new Date(asOfDate);

  // Normalize to UTC midnight
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const asOfUtc = Date.UTC(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((asOfUtc - targetUtc) / msPerDay);
}

/**
 * Categorizes an invoice into its appropriate aging bucket
 */
export function determineAgingBucket(overdueDays: number): AgingBucketType {
  if (overdueDays <= 0) {
    return 'CURRENT';
  }
  if (overdueDays <= 30) {
    return 'DAYS_1_30';
  }
  if (overdueDays <= 60) {
    return 'DAYS_31_60';
  }
  if (overdueDays <= 90) {
    return 'DAYS_61_90';
  }
  return 'OVER_90';
}

/**
 * Calculates complete receivables aging schedule for given invoices and asOfDate
 */
export function calculateReceivablesAging(
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    orderNumber: string;
    invoiceDate: string;
    dueDate: string;
    amountUsd: number;
    paidAmountUsd?: number;
  }>,
  asOfDate: string
): ReceivablesAgingSchedule {
  let totalReceivables = 0;
  let totalOverdue = 0;
  let currentAmount = 0;
  let days1to30Amount = 0;
  let days31to60Amount = 0;
  let days61to90Amount = 0;
  let over90Amount = 0;

  let currentCount = 0;
  let days1to30Count = 0;
  let days31to60Count = 0;
  let days61to90Count = 0;
  let over90Count = 0;

  const processedInvoices: AgingInvoiceItem[] = [];

  for (const inv of invoices) {
    const paid = inv.paidAmountUsd ?? 0;
    const outstanding = Math.max(0, inv.amountUsd - paid);

    if (outstanding <= 0) {
      continue;
    }

    const overdueDays = Math.max(0, calculateDaysDifference(inv.dueDate, asOfDate));
    const bucket = determineAgingBucket(overdueDays);

    processedInvoices.push({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      orderNumber: inv.orderNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      amountUsd: inv.amountUsd,
      paidAmountUsd: paid,
      outstandingAmountUsd: Math.round(outstanding * 100) / 100,
      overdueDays,
      bucket,
    });

    totalReceivables += outstanding;

    switch (bucket) {
      case 'CURRENT':
        currentAmount += outstanding;
        currentCount += 1;
        break;
      case 'DAYS_1_30':
        days1to30Amount += outstanding;
        days1to30Count += 1;
        totalOverdue += outstanding;
        break;
      case 'DAYS_31_60':
        days31to60Amount += outstanding;
        days31to60Count += 1;
        totalOverdue += outstanding;
        break;
      case 'DAYS_61_90':
        days61to90Amount += outstanding;
        days61to90Count += 1;
        totalOverdue += outstanding;
        break;
      case 'OVER_90':
        over90Amount += outstanding;
        over90Count += 1;
        totalOverdue += outstanding;
        break;
    }
  }

  const safeTotal = totalReceivables > 0 ? totalReceivables : 1;

  const calcPercentage = (amt: number): number => {
    if (totalReceivables <= 0) return 0;
    return Math.round((amt / safeTotal) * 1000) / 10;
  };

  const buckets: AgingBucketSummary[] = [
    {
      bucket: 'CURRENT',
      label: 'Current (Not Due)',
      amountUsd: Math.round(currentAmount * 100) / 100,
      invoiceCount: currentCount,
      percentage: calcPercentage(currentAmount),
    },
    {
      bucket: 'DAYS_1_30',
      label: '1–30 Days Overdue',
      amountUsd: Math.round(days1to30Amount * 100) / 100,
      invoiceCount: days1to30Count,
      percentage: calcPercentage(days1to30Amount),
    },
    {
      bucket: 'DAYS_31_60',
      label: '31–60 Days Overdue',
      amountUsd: Math.round(days31to60Amount * 100) / 100,
      invoiceCount: days31to60Count,
      percentage: calcPercentage(days31to60Amount),
    },
    {
      bucket: 'DAYS_61_90',
      label: '61–90 Days Overdue',
      amountUsd: Math.round(days61to90Amount * 100) / 100,
      invoiceCount: days61to90Count,
      percentage: calcPercentage(days61to90Amount),
    },
    {
      bucket: 'OVER_90',
      label: '>90 Days Overdue',
      amountUsd: Math.round(over90Amount * 100) / 100,
      invoiceCount: over90Count,
      percentage: calcPercentage(over90Amount),
    },
  ];

  return {
    asOfDate,
    totalReceivablesUsd: Math.round(totalReceivables * 100) / 100,
    totalOverdueUsd: Math.round(totalOverdue * 100) / 100,
    overduePercentage: totalReceivables > 0 ? Math.round((totalOverdue / totalReceivables) * 1000) / 10 : 0,
    currentAmountUsd: Math.round(currentAmount * 100) / 100,
    days1to30AmountUsd: Math.round(days1to30Amount * 100) / 100,
    days31to60AmountUsd: Math.round(days31to60Amount * 100) / 100,
    days61to90AmountUsd: Math.round(days61to90Amount * 100) / 100,
    over90AmountUsd: Math.round(over90Amount * 100) / 100,
    buckets,
    invoices: processedInvoices,
  };
}
