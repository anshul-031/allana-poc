import { describe, it, expect } from 'vitest';
import {
  calculateDelta,
  determineStatus,
  formatMetricValue,
  createSkuPlanItem,
  aggregateSalesPlan,
} from '@/lib/sales-plan-calc';

describe('Sales Plan Calculation Engine (FEAT-6.3)', () => {
  describe('calculateDelta', () => {
    it('calculates Delta = (Shipped + Pipeline) - Target correctly', () => {
      // 50 shipped + 20 pipeline - 100 target = -30 (deficit)
      expect(calculateDelta(50, 20, 100)).toBe(-30);

      // 60 shipped + 40 pipeline - 100 target = 0 (balanced)
      expect(calculateDelta(60, 40, 100)).toBe(0);

      // 70 shipped + 50 pipeline - 100 target = +20 (surplus)
      expect(calculateDelta(70, 50, 100)).toBe(20);
    });

    it('handles floating point precision properly', () => {
      expect(calculateDelta(0.1, 0.2, 0.4)).toBe(-0.1);
      expect(calculateDelta(10.555, 5.222, 12.001)).toBe(3.78);
    });
  });

  describe('determineStatus', () => {
    it('returns SURPLUS for non-negative deltas and DEFICIT for negative deltas', () => {
      expect(determineStatus(15)).toBe('SURPLUS');
      expect(determineStatus(0)).toBe('SURPLUS');
      expect(determineStatus(-0.01)).toBe('DEFICIT');
      expect(determineStatus(-500)).toBe('DEFICIT');
    });
  });

  describe('formatMetricValue', () => {
    it('formats TONNES values without delta prefix', () => {
      expect(formatMetricValue(120, 'TONNES')).toBe('120.00 MT');
      expect(formatMetricValue(1250.75, 'TONNES')).toBe('1,250.75 MT');
      expect(formatMetricValue(-50, 'TONNES')).toBe('-50.00 MT');
    });

    it('formats TONNES values with delta prefix (+/-)', () => {
      expect(formatMetricValue(24.5, 'TONNES', true)).toBe('+24.50 MT');
      expect(formatMetricValue(-18.25, 'TONNES', true)).toBe('-18.25 MT');
      expect(formatMetricValue(0, 'TONNES', true)).toBe('+0.00 MT');
    });

    it('formats USD values without delta prefix', () => {
      expect(formatMetricValue(540000, 'USD')).toBe('$540,000');
      expect(formatMetricValue(-12000, 'USD')).toBe('-$12,000');
    });

    it('formats USD values with delta prefix (+/-)', () => {
      expect(formatMetricValue(32000, 'USD', true)).toBe('+$32,000');
      expect(formatMetricValue(-14500, 'USD', true)).toBe('-$14,500');
      expect(formatMetricValue(0, 'USD', true)).toBe('+$0');
    });
  });

  describe('createSkuPlanItem', () => {
    it('creates SKU plan item with computed deltas and statuses', () => {
      const item = createSkuPlanItem({
        id: 'plan-1',
        sku: 'AL-BUF-TOP-01',
        skuName: 'Frozen Buffalo Topside 20kg',
        targetTonnes: 100,
        targetUsd: 480000,
        lastMonthBalanceTonnes: 10,
        lastMonthBalanceUsd: 48000,
        shippedTonnes: 60,
        shippedUsd: 288000,
        pipelineTonnes: 20,
        pipelineUsd: 96000,
      });

      expect(item.id).toBe('plan-1');
      expect(item.sku).toBe('AL-BUF-TOP-01');
      expect(item.deltaTonnes).toBe(-20); // (60 + 20) - 100 = -20
      expect(item.statusTonnes).toBe('DEFICIT');
      expect(item.deltaUsd).toBe(-96000); // (288000 + 96000) - 480000 = -96000
      expect(item.statusUsd).toBe('DEFICIT');
      expect(item.lastMonthBalanceTonnes).toBe(10);
      expect(item.lastMonthBalanceUsd).toBe(48000);
    });

    it('defaults lastMonthBalance to 0 if omitted', () => {
      const item = createSkuPlanItem({
        id: 'plan-2',
        sku: 'AL-BUF-SIL-01',
        skuName: 'Frozen Buffalo Silverside 20kg',
        targetTonnes: 50,
        targetUsd: 240000,
        shippedTonnes: 40,
        shippedUsd: 192000,
        pipelineTonnes: 20,
        pipelineUsd: 96000,
      });

      expect(item.lastMonthBalanceTonnes).toBe(0);
      expect(item.lastMonthBalanceUsd).toBe(0);
      expect(item.deltaTonnes).toBe(10); // (40 + 20) - 50 = +10
      expect(item.statusTonnes).toBe('SURPLUS');
    });
  });

  describe('aggregateSalesPlan', () => {
    it('accurately groups raw records by country and ship-to with correct hierarchical rollups', () => {
      const rawRecords = [
        {
          id: 'rec-1',
          country: 'Saudi Arabia',
          shipToParty: 'Carrefour Riyadh',
          sku: 'SKU-01',
          skuName: 'Buffalo Topside',
          targetTonnes: 100,
          targetUsd: 500000,
          lastMonthBalanceTonnes: 10,
          lastMonthBalanceUsd: 50000,
          shippedTonnes: 60,
          shippedUsd: 300000,
          pipelineTonnes: 20,
          pipelineUsd: 100000,
        },
        {
          id: 'rec-2',
          country: 'Saudi Arabia',
          shipToParty: 'Carrefour Riyadh',
          sku: 'SKU-02',
          skuName: 'Buffalo Tenderloin',
          targetTonnes: 50,
          targetUsd: 350000,
          shippedTonnes: 40,
          shippedUsd: 280000,
          pipelineTonnes: 20,
          pipelineUsd: 140000,
        },
        {
          id: 'rec-3',
          country: 'Saudi Arabia',
          shipToParty: 'LuLu Dammam',
          sku: 'SKU-03',
          skuName: 'Buffalo Chuck Roll',
          targetTonnes: 80,
          targetUsd: 360000,
          shippedTonnes: 80,
          shippedUsd: 360000,
          pipelineTonnes: 10,
          pipelineUsd: 45000,
        },
        {
          id: 'rec-4',
          country: 'United Arab Emirates',
          shipToParty: 'LuLu JAFZA',
          sku: 'SKU-04',
          skuName: 'Buffalo Striploin',
          targetTonnes: 120,
          targetUsd: 600000,
          lastMonthBalanceTonnes: 20,
          lastMonthBalanceUsd: 100000,
          shippedTonnes: 100,
          shippedUsd: 500000,
          pipelineTonnes: 30,
          pipelineUsd: 150000,
        },
      ];

      const summary = aggregateSalesPlan(rawRecords);

      expect(summary.countries).toHaveLength(2);

      // Grand total checks
      expect(summary.grandTotal.totalCountries).toBe(2);
      expect(summary.grandTotal.totalShipToParties).toBe(3);
      expect(summary.grandTotal.totalSkus).toBe(4);
      expect(summary.grandTotal.targetTonnes).toBe(350); // 100 + 50 + 80 + 120
      expect(summary.grandTotal.targetUsd).toBe(1810000); // 500k + 350k + 360k + 600k
      expect(summary.grandTotal.shippedTonnes).toBe(280); // 60 + 40 + 80 + 100
      expect(summary.grandTotal.pipelineTonnes).toBe(80); // 20 + 20 + 10 + 30
      // grand delta = (280 + 80) - 350 = 10
      expect(summary.grandTotal.deltaTonnes).toBe(10);
      expect(summary.grandTotal.statusTonnes).toBe('SURPLUS');

      // Check Saudi Arabia country group
      const saudi = summary.countries.find((c) => c.country === 'Saudi Arabia')!;
      expect(saudi).toBeDefined();
      expect(saudi.shipToGroups).toHaveLength(2);
      expect(saudi.totals.totalSkus).toBe(3);
      expect(saudi.totals.targetTonnes).toBe(230); // 100 + 50 + 80
      expect(saudi.totals.shippedTonnes).toBe(180); // 60 + 40 + 80
      expect(saudi.totals.pipelineTonnes).toBe(50); // 20 + 20 + 10
      // saudi delta = (180 + 50) - 230 = 0
      expect(saudi.totals.deltaTonnes).toBe(0);
      expect(saudi.totals.statusTonnes).toBe('SURPLUS');

      // Check Carrefour Riyadh ship to group
      const carrefour = saudi.shipToGroups.find((s) => s.shipToParty === 'Carrefour Riyadh')!;
      expect(carrefour).toBeDefined();
      expect(carrefour.items).toHaveLength(2);
      expect(carrefour.totals.targetTonnes).toBe(150); // 100 + 50
      expect(carrefour.totals.shippedTonnes).toBe(100); // 60 + 40
      expect(carrefour.totals.pipelineTonnes).toBe(40); // 20 + 20
      // delta = (100 + 40) - 150 = -10 (DEFICIT)
      expect(carrefour.totals.deltaTonnes).toBe(-10);
      expect(carrefour.totals.statusTonnes).toBe('DEFICIT');

      // Check UAE group
      const uae = summary.countries.find((c) => c.country === 'United Arab Emirates')!;
      expect(uae.totals.deltaTonnes).toBe(10); // (100 + 30) - 120 = +10
      expect(uae.totals.statusTonnes).toBe('SURPLUS');
    });

    it('handles empty input gracefully', () => {
      const summary = aggregateSalesPlan([]);
      expect(summary.countries).toHaveLength(0);
      expect(summary.grandTotal.targetTonnes).toBe(0);
      expect(summary.grandTotal.totalCountries).toBe(0);
      expect(summary.grandTotal.deltaTonnes).toBe(0);
      expect(summary.grandTotal.statusTonnes).toBe('SURPLUS');
    });
  });
});
