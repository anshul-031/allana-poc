import { describe, it, expect } from 'vitest';
import {
  FALLBACK_CLAIMS,
  filterFallbackClaims,
} from '@/lib/fallback-claims';

describe('src/lib/fallback-claims.ts - Fallback Claims & Regulatory Requests', () => {
  it('contains claims and information requests with complete fields', () => {
    expect(FALLBACK_CLAIMS.length).toBeGreaterThanOrEqual(8);
    FALLBACK_CLAIMS.forEach((c) => {
      expect(c.id).toBeDefined();
      expect(c.claimNumber).toBeTruthy();
      expect(c.subject).toBeTruthy();
      expect(['CLAIM', 'INFO_REQUEST']).toContain(c.type);
      expect(c.status).toBeTruthy();
    });
  });

  it('filters claims by type, status, and search query', () => {
    // 1. By type
    const claimRes = filterFallbackClaims({ type: 'CLAIM' });
    expect(claimRes.total).toBeGreaterThan(0);
    expect(claimRes.claims.every((c) => c.type === 'CLAIM')).toBe(true);

    // 2. By status
    const underReviewRes = filterFallbackClaims({ status: 'UNDER_REVIEW' });
    expect(underReviewRes.total).toBeGreaterThan(0);
    expect(underReviewRes.claims.every((c) => c.status === 'UNDER_REVIEW')).toBe(true);

    // 3. By search query
    const searchRes = filterFallbackClaims({ search: 'Sedex' });
    expect(searchRes.total).toBeGreaterThan(0);
    expect(searchRes.claims.some((c) => c.subject.includes('Sedex') || c.claimNumber.includes('Sedex'))).toBe(true);
  });

  it('supports pagination with offset and limit', () => {
    const p1 = filterFallbackClaims({ offset: 0, limit: 3 });
    expect(p1.claims.length).toBe(3);
    expect(p1.total).toBe(FALLBACK_CLAIMS.length);

    const p2 = filterFallbackClaims({ offset: 3, limit: 3 });
    expect(p2.claims.length).toBe(3);
    expect(p2.claims[0].id).not.toBe(p1.claims[0].id);

    const all = filterFallbackClaims();
    expect(all.claims.length).toBe(Math.min(20, FALLBACK_CLAIMS.length));
  });
});
