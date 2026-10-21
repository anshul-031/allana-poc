import { describe, it, expect } from 'vitest';
import { FALLBACK_NPD_REQUESTS } from '@/lib/fallback-npd';

describe('src/lib/fallback-npd.ts - Fallback NPD Requests', () => {
  it('contains customized product requests with required specifications', () => {
    expect(FALLBACK_NPD_REQUESTS.length).toBeGreaterThanOrEqual(4);
    FALLBACK_NPD_REQUESTS.forEach((req) => {
      expect(req.id).toBeDefined();
      expect(req.requestNumber).toMatch(/^NPD-2026-/);
      expect(req.companyName).toBeTruthy();
      expect(req.categoryName).toBeTruthy();
      expect(req.targetCountry).toBeTruthy();
      expect(req.cutSpecification).toBeTruthy();
      expect(req.packagingFormat).toBeTruthy();
      expect(req.estimatedFcaPricePerTon).toBeGreaterThan(0);
      expect(req.targetVolumeMt).toBeGreaterThan(0);
      expect(req.targetPriceUsd).toBeGreaterThan(0);
      expect(['IN_REVIEW', 'ANALYSIS', 'ACCEPTED', 'REJECTED']).toContain(req.status);
    });
  });
});
