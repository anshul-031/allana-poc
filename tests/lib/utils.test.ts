import { describe, it, expect } from 'vitest';
import {
  formatUSD,
  formatDate,
  formatWeight,
  cn,
  calculateDelta,
} from '@/lib/utils';

describe('src/lib/utils.ts - Export Portal Helpers', () => {
  describe('formatUSD', () => {
    it('formats standard positive numbers to currency string', () => {
      expect(formatUSD(1216350.02)).toBe('$1,216,350.02');
      expect(formatUSD('2500000')).toBe('$2,500,000.00');
    });

    it('formats negative balances with deficit suffix', () => {
      expect(formatUSD(-272796.96)).toBe('-$272,796.96 USD');
      expect(formatUSD('-1500.5')).toBe('-$1,500.50 USD');
    });

    it('handles null, undefined and invalid input gracefully', () => {
      expect(formatUSD(null)).toBe('$0.00');
      expect(formatUSD(undefined)).toBe('$0.00');
      expect(formatUSD('invalid')).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    it('formats standard date string to DD.MM.YYYY', () => {
      const date = new Date(2026, 9, 19, 14, 30, 45); // Oct 19, 2026
      expect(formatDate(date)).toBe('19.10.2026');
    });

    it('formats date with timestamp when includeTime is true', () => {
      const date = new Date(2026, 9, 19, 14, 5, 9);
      expect(formatDate(date, true)).toBe('19.10.2026 14:05:09');
    });

    it('handles null, undefined and invalid dates gracefully', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
      expect(formatDate('not-a-date')).toBe('—');
    });
  });

  describe('formatWeight', () => {
    it('formats weight in KG with default 2 decimals', () => {
      expect(formatWeight(97983)).toBe('97,983.00 KG');
      expect(formatWeight('12.5')).toBe('12.50 KG');
    });

    it('formats weight with 4-decimal precision for claims', () => {
      expect(formatWeight(45.1234, 4)).toBe('45.1234 KG');
      expect(formatWeight('100.5', 4, false)).toBe('100.5000');
    });

    it('handles null and undefined weights gracefully', () => {
      expect(formatWeight(null)).toBe('0.00 KG');
      expect(formatWeight(undefined, 4, false)).toBe('0.0000');
      expect(formatWeight('invalid')).toBe('0.00 KG');
    });
  });

  describe('cn (ClassName merger)', () => {
    it('merges multiple valid class strings and filters falsy values', () => {
      expect(cn('btn', 'btn-primary', false, null, undefined, 'active')).toBe(
        'btn btn-primary active'
      );
      expect(cn('card', true && 'highlight', false && 'hidden')).toBe('card highlight');
    });
  });

  describe('calculateDelta', () => {
    it('calculates positive delta (surplus)', () => {
      const res = calculateDelta(100, 20, 100);
      expect(res.delta).toBe(20);
      expect(res.isDeficit).toBe(false);
      expect(res.formatted).toBe('+20.00');
    });

    it('calculates negative delta (deficit)', () => {
      const res = calculateDelta(50, 20, 100);
      expect(res.delta).toBe(-30);
      expect(res.isDeficit).toBe(true);
      expect(res.formatted).toBe('-30.00');
    });

    it('calculates zero delta exactly on target', () => {
      const res = calculateDelta(80, 20, 100);
      expect(res.delta).toBe(0);
      expect(res.isDeficit).toBe(false);
      expect(res.formatted).toBe('0.00');
    });
  });
});
