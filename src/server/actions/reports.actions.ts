'use server';

import { prisma } from '@/lib/prisma';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import {
  ReceivablesAgingSchedule,
  calculateReceivablesAging,
} from '@/lib/aging-calc';
import { sendReportEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export interface StatementTransactionDTO {
  id: string;
  date: string;
  docNumber: string;
  docType: 'OPENING_BALANCE' | 'INVOICE' | 'PAYMENT' | 'CREDIT_MEMO';
  description: string;
  debitUsd: number;
  creditUsd: number;
  balanceUsd: number;
}

export interface StatementOfAccountDTO {
  companyName: string;
  companyCode: string;
  primaryEmail: string;
  fromDate: string;
  toDate: string;
  openingBalanceUsd: number;
  totalDebitsUsd: number;
  totalCreditsUsd: number;
  closingBalanceUsd: number;
  transactions: StatementTransactionDTO[];
}

export interface GetStatementResult {
  success: boolean;
  error?: string;
  statement: StatementOfAccountDTO | null;
}

export interface GetAgingResult {
  success: boolean;
  error?: string;
  aging: ReceivablesAgingSchedule | null;
  primaryEmail: string;
}

export interface DispatchReportResult {
  success: boolean;
  error?: string;
  message?: string;
  recipients: string[];
}

export async function getActiveCompanyIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ACTIVE_COMPANY_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Curated transactions for Statement of Account
 */
const SEED_TRANSACTIONS: Omit<StatementTransactionDTO, 'balanceUsd'>[] = [
  {
    id: 'tx-0',
    date: '2026-10-01',
    docNumber: 'OP-BAL',
    docType: 'OPENING_BALANCE',
    description: 'Brought forward account opening balance',
    debitUsd: 145000.0,
    creditUsd: 0.0,
  },
  {
    id: 'tx-1',
    date: '2026-10-04',
    docNumber: 'INV-2026-88192',
    docType: 'INVOICE',
    description: 'Export Shipment ORD-2026-88192 (48 MT Buffalo Cuts)',
    debitUsd: 220800.0,
    creditUsd: 0.0,
  },
  {
    id: 'tx-2',
    date: '2026-10-08',
    docNumber: 'PAY-77182',
    docType: 'PAYMENT',
    description: 'Wire Transfer Swift Ref: AL-SA-994821 (Riyadh Bank)',
    debitUsd: 0.0,
    creditUsd: 145000.0,
  },
  {
    id: 'tx-3',
    date: '2026-10-12',
    docNumber: 'INV-2026-88045',
    docType: 'INVOICE',
    description: 'Export Shipment ORD-2026-88045 (28 MT Buffalo Silverside)',
    debitUsd: 134400.0,
    creditUsd: 0.0,
  },
  {
    id: 'tx-4',
    date: '2026-10-16',
    docNumber: 'CR-1044',
    docType: 'CREDIT_MEMO',
    description: 'Quality Allowance Settlement Claim CLM-2026-0042',
    debitUsd: 0.0,
    creditUsd: 8500.0,
  },
];

/**
 * Curated aging invoices
 */
const SEED_AGING_INVOICES = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-88192',
    orderNumber: 'ORD-2026-88192',
    invoiceDate: '2026-10-04',
    dueDate: '2026-11-03', // 30-day terms => Not overdue (Current)
    amountUsd: 220800.0,
    paidAmountUsd: 0.0,
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-88045',
    orderNumber: 'ORD-2026-88045',
    invoiceDate: '2026-09-15',
    dueDate: '2026-10-15', // Overdue by ~4 days
    amountUsd: 134400.0,
    paidAmountUsd: 50000.0, // Outstanding: $84,400
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-87910',
    orderNumber: 'ORD-2026-87910',
    invoiceDate: '2026-08-10',
    dueDate: '2026-09-09', // Overdue by ~40 days (31-60 bracket)
    amountUsd: 96000.0,
    paidAmountUsd: 0.0,
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-87420',
    orderNumber: 'ORD-2026-87420',
    invoiceDate: '2026-07-05',
    dueDate: '2026-08-04', // Overdue by ~75 days (61-90 bracket)
    amountUsd: 64500.0,
    paidAmountUsd: 0.0,
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-86900',
    orderNumber: 'ORD-2026-86900',
    invoiceDate: '2026-05-12',
    dueDate: '2026-06-11', // Overdue by >120 days (>90 bracket)
    amountUsd: 42000.0,
    paidAmountUsd: 12000.0, // Outstanding: $30,000
  },
];

/**
 * Fetch Statement of Account with running balance
 */
export async function getStatementOfAccount(options?: {
  fromDate?: string;
  toDate?: string;
}): Promise<GetStatementResult> {
  try {
    const companyId = await getActiveCompanyIdFromCookies();

    let companyName = 'Global Foods Trading LLC';
    let companyCode = 'COMP-SA-001';
    let primaryEmail = 'procurement@globalfoods.com';

    if (companyId) {
      const comp = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, code: true, email: true },
      });
      if (comp) {
        companyName = comp.name;
        companyCode = comp.code;
        primaryEmail = comp.email;
      }
    }

    const fromDate = options?.fromDate || '2026-10-01';
    const toDate = options?.toDate || '2026-10-31';

    let runningBalance = 0;
    let totalDebits = 0;
    let totalCredits = 0;

    const transactions: StatementTransactionDTO[] = [];

    for (const tx of SEED_TRANSACTIONS) {
      // Filter by date range
      if (tx.docType !== 'OPENING_BALANCE') {
        if (tx.date < fromDate || tx.date > toDate) {
          continue;
        }
      }

      runningBalance = runningBalance + tx.debitUsd - tx.creditUsd;
      totalDebits += tx.debitUsd;
      totalCredits += tx.creditUsd;

      transactions.push({
        ...tx,
        balanceUsd: Math.round(runningBalance * 100) / 100,
      });
    }

    const openingBalanceUsd = SEED_TRANSACTIONS[0].debitUsd;
    const closingBalanceUsd = Math.round(runningBalance * 100) / 100;

    return {
      success: true,
      statement: {
        companyName,
        companyCode,
        primaryEmail,
        fromDate,
        toDate,
        openingBalanceUsd,
        totalDebitsUsd: Math.round(totalDebits * 100) / 100,
        totalCreditsUsd: Math.round(totalCredits * 100) / 100,
        closingBalanceUsd,
        transactions,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to generate Statement of Account',
      statement: null,
    };
  }
}

/**
 * Fetch Accounts Receivables Aging Report
 */
export async function getReceivablesAging(options?: {
  asOfDate?: string;
}): Promise<GetAgingResult> {
  try {
    const companyId = await getActiveCompanyIdFromCookies();

    let primaryEmail = 'procurement@globalfoods.com';

    if (companyId) {
      const comp = await prisma.company.findUnique({
        where: { id: companyId },
        select: { email: true },
      });
      if (comp?.email) {
        primaryEmail = comp.email;
      }
    }

    const asOfDate = options?.asOfDate || new Date().toISOString().split('T')[0];

    const agingSchedule = calculateReceivablesAging(SEED_AGING_INVOICES, asOfDate);

    return {
      success: true,
      aging: agingSchedule,
      primaryEmail,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to calculate Receivables Aging report',
      aging: null,
      primaryEmail: 'procurement@globalfoods.com',
    };
  }
}

/**
 * Send financial report via email to primary and additional recipients
 */
export async function dispatchReportEmail(options: {
  reportType: 'STATEMENT_OF_ACCOUNT' | 'RECEIVABLES_AGING';
  fromDate?: string;
  toDate?: string;
  asOfDate?: string;
  additionalEmail?: string | null;
}): Promise<DispatchReportResult> {
  try {
    const companyId = await getActiveCompanyIdFromCookies();

    let companyName = 'Global Foods Trading LLC';
    let primaryEmail = 'procurement@globalfoods.com';

    if (companyId) {
      const comp = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, email: true },
      });
      if (comp) {
        companyName = comp.name;
        primaryEmail = comp.email;
      }
    }

    const periodLabel =
      options.reportType === 'STATEMENT_OF_ACCOUNT'
        ? `${options.fromDate || '2026-10-01'} to ${options.toDate || '2026-10-31'}`
        : `As of ${options.asOfDate || new Date().toISOString().split('T')[0]}`;

    const fileName =
      options.reportType === 'STATEMENT_OF_ACCOUNT'
        ? `Statement_of_Account_${periodLabel.replace(/[\s:]/g, '_')}.pdf`
        : `Receivables_Aging_${periodLabel.replace(/[\s:]/g, '_')}.pdf`;

    const sendRes = await sendReportEmail({
      reportType: options.reportType,
      primaryEmail,
      additionalEmail: options.additionalEmail,
      companyName,
      periodLabel,
      fileAttachmentName: fileName,
    });

    if (!sendRes.success) {
      return {
        success: false,
        error: sendRes.error,
        recipients: [],
      };
    }

    // Record in ActionLog if companyId exists
    if (companyId) {
      try {
        const author = await prisma.user.findFirst({ where: { companyId } });
        if (author) {
          await prisma.actionLog.create({
            data: {
              companyId,
              authorId: author.id,
              action: 'EXPORT_REPORT',
              comment: `Dispatched ${options.reportType} (${periodLabel}) to: ${sendRes.recipients.join(', ')}`,
            },
          });
        }
      } catch {
        // Non-blocking log write
      }
    }

    return {
      success: true,
      message: `Report successfully dispatched to ${sendRes.recipients.join(', ')}`,
      recipients: sendRes.recipients,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to dispatch report by email',
      recipients: [],
    };
  }
}
