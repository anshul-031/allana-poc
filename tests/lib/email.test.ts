import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  parseEmailList,
  sendReportEmail,
} from '@/lib/email';

describe('Partner Email Dispatcher (FEAT-7.1, FEAT-7.2)', () => {
  describe('isValidEmail', () => {
    it('validates proper email formats', () => {
      expect(isValidEmail('finance@allana.com')).toBe(true);
      expect(isValidEmail('buyer.procurement@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missingusername.com')).toBe(false);
      expect(isValidEmail(null as unknown as string)).toBe(false);
    });
  });

  describe('parseEmailList', () => {
    it('splits and sanitizes comma- and semicolon-delimited lists', () => {
      const input = 'finance@partner.com; controller@partner.com, cfo@partner.com';
      const parsed = parseEmailList(input);
      expect(parsed).toEqual([
        'finance@partner.com',
        'controller@partner.com',
        'cfo@partner.com',
      ]);
    });

    it('handles null, empty, or whitespace strings safely', () => {
      expect(parseEmailList(null)).toEqual([]);
      expect(parseEmailList('')).toEqual([]);
      expect(parseEmailList('   ')).toEqual([]);
    });
  });

  describe('sendReportEmail', () => {
    it('successfully dispatches report to primary and additional email recipients', async () => {
      const result = await sendReportEmail({
        reportType: 'STATEMENT_OF_ACCOUNT',
        primaryEmail: 'accounting@partner.com',
        additionalEmail: 'audit@partner.com; treasury@partner.com',
        companyName: 'Global Foods Trading LLC',
        periodLabel: '2026-10-01 to 2026-10-31',
        fileAttachmentName: 'Statement.pdf',
      });

      expect(result.success).toBe(true);
      expect(result.recipients).toEqual([
        'accounting@partner.com',
        'audit@partner.com',
        'treasury@partner.com',
      ]);
      expect(result.messageId).toContain('msg-');
    });

    it('rejects dispatch when primary email is invalid', async () => {
      const result = await sendReportEmail({
        reportType: 'RECEIVABLES_AGING',
        primaryEmail: 'not-an-email',
        companyName: 'Global Foods Trading LLC',
        periodLabel: 'As of 2026-10-15',
        fileAttachmentName: 'Aging.pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid primary email');
      expect(result.recipients).toHaveLength(0);
    });
  });
});
