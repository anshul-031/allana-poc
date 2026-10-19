import { describe, it, expect } from 'vitest';
import {
  calculateDaysDifference,
  determineAgingBucket,
  calculateReceivablesAging,
} from '@/lib/aging-calc';

describe('Accounts Receivables Aging Calculator (FEAT-7.2)', () => {
  describe('calculateDaysDifference', () => {
    it('calculates calendar day differences between due date and as-of date', () => {
      expect(calculateDaysDifference('2026-10-01', '2026-10-15')).toBe(14);
      expect(calculateDaysDifference('2026-10-15', '2026-10-01')).toBe(-14);
      expect(calculateDaysDifference('2026-10-10', '2026-10-10')).toBe(0);
    });
  });

  describe('determineAgingBucket', () => {
    it('classifies 0 or negative days as CURRENT', () => {
      expect(determineAgingBucket(0)).toBe('CURRENT');
      expect(determineAgingBucket(-5)).toBe('CURRENT');
    });

    it('classifies 1 to 30 days as DAYS_1_30', () => {
      expect(determineAgingBucket(1)).toBe('DAYS_1_30');
      expect(determineAgingBucket(15)).toBe('DAYS_1_30');
      expect(determineAgingBucket(30)).toBe('DAYS_1_30');
    });

    it('classifies 31 to 60 days as DAYS_31_60', () => {
      expect(determineAgingBucket(31)).toBe('DAYS_31_60');
      expect(determineAgingBucket(45)).toBe('DAYS_31_60');
      expect(determineAgingBucket(60)).toBe('DAYS_31_60');
    });

    it('classifies 61 to 90 days as DAYS_61_90', () => {
      expect(determineAgingBucket(61)).toBe('DAYS_61_90');
      expect(determineAgingBucket(75)).toBe('DAYS_61_90');
      expect(determineAgingBucket(90)).toBe('DAYS_61_90');
    });

    it('classifies >90 days as OVER_90', () => {
      expect(determineAgingBucket(91)).toBe('OVER_90');
      expect(determineAgingBucket(120)).toBe('OVER_90');
      expect(determineAgingBucket(365)).toBe('OVER_90');
    });
  });

  describe('calculateReceivablesAging', () => {
    it('calculates full aging schedule with bucket aggregations, percentages, and invoices', () => {
      const asOfDate = '2026-10-15';

      const mockInvoices = [
        {
          id: 'inv-1',
          invoiceNumber: 'INV-01',
          orderNumber: 'ORD-01',
          invoiceDate: '2026-10-01',
          dueDate: '2026-10-25', // Future due date -> CURRENT
          amountUsd: 100000,
          paidAmountUsd: 0,
        },
        {
          id: 'inv-2',
          invoiceNumber: 'INV-02',
          orderNumber: 'ORD-02',
          invoiceDate: '2026-09-10',
          dueDate: '2026-09-30', // 15 days overdue -> DAYS_1_30
          amountUsd: 60000,
          paidAmountUsd: 10000, // Outstanding: 50,000
        },
        {
          id: 'inv-3',
          invoiceNumber: 'INV-03',
          orderNumber: 'ORD-03',
          invoiceDate: '2026-08-15',
          dueDate: '2026-08-30', // 46 days overdue -> DAYS_31_60
          amountUsd: 40000,
        },
        {
          id: 'inv-4',
          invoiceNumber: 'INV-04',
          orderNumber: 'ORD-04',
          invoiceDate: '2026-07-01',
          dueDate: '2026-07-20', // 87 days overdue -> DAYS_61_90
          amountUsd: 30000,
        },
        {
          id: 'inv-5',
          invoiceNumber: 'INV-05',
          orderNumber: 'ORD-05',
          invoiceDate: '2026-05-01',
          dueDate: '2026-05-30', // 138 days overdue -> OVER_90
          amountUsd: 20000,
        },
        {
          id: 'inv-paid',
          invoiceNumber: 'INV-PAID',
          orderNumber: 'ORD-PAID',
          invoiceDate: '2026-05-01',
          dueDate: '2026-05-30',
          amountUsd: 15000,
          paidAmountUsd: 15000, // Fully paid -> ignored
        },
      ];

      const schedule = calculateReceivablesAging(mockInvoices, asOfDate);

      // Total Outstanding: 100k + 50k + 40k + 30k + 20k = 240,000
      expect(schedule.totalReceivablesUsd).toBe(240000);
      expect(schedule.currentAmountUsd).toBe(100000);
      expect(schedule.days1to30AmountUsd).toBe(50000);
      expect(schedule.days31to60AmountUsd).toBe(40000);
      expect(schedule.days61to90AmountUsd).toBe(30000);
      expect(schedule.over90AmountUsd).toBe(20000);

      // Total Overdue: 50k + 40k + 30k + 20k = 140,000
      expect(schedule.totalOverdueUsd).toBe(140000);
      expect(schedule.overduePercentage).toBe(58.3); // 140000 / 240000 * 100

      expect(schedule.invoices).toHaveLength(5);
      expect(schedule.buckets).toHaveLength(5);
    });

    it('handles empty invoice lists properly without dividing by zero', () => {
      const schedule = calculateReceivablesAging([], '2026-10-15');

      expect(schedule.totalReceivablesUsd).toBe(0);
      expect(schedule.totalOverdueUsd).toBe(0);
      expect(schedule.overduePercentage).toBe(0);
      expect(schedule.buckets[0].percentage).toBe(0);
      expect(schedule.invoices).toHaveLength(0);
    });
  });
});
