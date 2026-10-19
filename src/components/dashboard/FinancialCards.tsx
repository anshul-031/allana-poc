'use client';

import React, { useState, useEffect } from 'react';
import SalesOrgSelector from '@/components/dashboard/SalesOrgSelector';
import {
  GetFinancialsResult,
  FinancialMetricDTO,
  getCompanyFinancials,
} from '@/server/actions/financials.actions';
import { formatCurrencyAmount } from '@/lib/utils';


export interface FinancialCardsProps {
  initialData?: GetFinancialsResult;
  companyId?: string;
  onSalesOrgChange?: (salesOrgId: string) => void;
}

export default function FinancialCards({
  initialData,
  companyId,
  onSalesOrgChange,
}: FinancialCardsProps) {
  const [data, setData] = useState<GetFinancialsResult | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [selectedSalesOrgId, setSelectedSalesOrgId] = useState<string | undefined>(
    initialData?.selectedSalesOrgId || initialData?.availableSalesOrgs[0]?.id
  );

  useEffect(() => {
    if (!initialData) {
      setIsLoading(true);
      getCompanyFinancials({ companyId, salesOrgId: selectedSalesOrgId })
        .then((res) => {
          setData(res);
          if (res.selectedSalesOrgId && !selectedSalesOrgId) {
            setSelectedSalesOrgId(res.selectedSalesOrgId);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialData, companyId, selectedSalesOrgId]);

  const handleSalesOrgSelect = async (orgId: string) => {
    setSelectedSalesOrgId(orgId);
    if (onSalesOrgChange) {
      onSalesOrgChange(orgId);
    }
    setIsLoading(true);
    try {
      const res = await getCompanyFinancials({ companyId, salesOrgId: orgId });
      setData(res);
    } finally {
      setIsLoading(false);
    }
  };

  const financials: FinancialMetricDTO | null = data?.financials || null;
  const salesOrgs = data?.availableSalesOrgs || [];

  return (
    <section
      data-testid="financial-indicators-section"
      aria-labelledby="financial-section-heading"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-xl)',
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)',
      }}
    >
      {/* Top Header & Sales Org Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          paddingBottom: 'var(--spacing-md)',
          borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))',
        }}
      >
        <div>
          <h2
            id="financial-section-heading"
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 2px 0',
            }}
          >
            Financial Indicators & Credit Facility
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Real-time balance, approved limits, and aged receivables across active export orders.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          {salesOrgs.length > 0 && (
            <SalesOrgSelector
              salesOrgs={salesOrgs}
              selectedSalesOrgId={selectedSalesOrgId}
              onSelect={handleSalesOrgSelect}
              disabled={isLoading}
            />
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <div
          data-testid="financial-loading-state"
          style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Updating financial indicators...
        </div>
      ) : !financials ? (
        <div
          data-testid="financial-empty-state"
          style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          No financial records configured for this operating entity.
        </div>
      ) : (
        <div
          data-testid="financial-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--spacing-md)',
          }}
        >
          {/* 1. Credit Limit */}
          <div
            data-testid="card-credit-limit"
            style={{
              backgroundColor: 'var(--color-background-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                Credit Limit
              </div>
              <div
                data-testid="value-credit-limit"
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrencyAmount(financials.creditLimit, financials.currency)}
              </div>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--spacing-sm)',
              }}
            >
              Approved revolving credit line
            </div>
          </div>

          {/* 2. Total Receivables */}
          <div
            data-testid="card-receivables"
            style={{
              backgroundColor: 'var(--color-background-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                Total Receivables
              </div>
              <div
                data-testid="value-receivables"
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrencyAmount(financials.receivables, financials.currency)}
              </div>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--spacing-sm)',
              }}
            >
              Current outstanding invoice balance
            </div>
          </div>

          {/* 3. Overdue Receivables */}
          <div
            data-testid="card-overdue"
            style={{
              backgroundColor:
                financials.overdueReceivables > 0
                  ? 'var(--color-error-bg, rgba(239, 68, 68, 0.06))'
                  : 'var(--color-background-subtle)',
              border:
                financials.overdueReceivables > 0
                  ? '1px solid var(--color-error-border, rgba(239, 68, 68, 0.25))'
                  : '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color:
                      financials.overdueReceivables > 0
                        ? 'var(--color-error, #dc2626)'
                        : 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Overdue Receivables
                </span>
                {financials.overdueReceivables > 0 && (
                  <span
                    data-testid="badge-overdue-alert"
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-error, #dc2626)',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: 'var(--border-radius-pill)',
                    }}
                  >
                    Action Required
                  </span>
                )}
              </div>
              <div
                data-testid="value-overdue"
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 700,
                  color:
                    financials.overdueReceivables > 0
                      ? 'var(--color-error, #dc2626)'
                      : 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrencyAmount(financials.overdueReceivables, financials.currency)}
              </div>
            </div>
            <div
              style={{
                fontSize: '11px',
                color:
                  financials.overdueReceivables > 0
                    ? 'var(--color-error, #dc2626)'
                    : 'var(--color-text-tertiary)',
                marginTop: 'var(--spacing-sm)',
              }}
            >
              {financials.overdueReceivables > 0
                ? 'Matured invoices past agreed terms'
                : 'Zero matured invoice exposure'}
            </div>
          </div>

          {/* 4. Available Limit (Supports Deficit Red Styling) */}
          <div
            data-testid="card-available-limit"
            style={{
              backgroundColor: financials.isDeficit
                ? 'var(--color-error-bg, rgba(239, 68, 68, 0.08))'
                : 'var(--color-success-bg, rgba(16, 185, 129, 0.06))',
              border: financials.isDeficit
                ? '1px solid var(--color-error-border, rgba(239, 68, 68, 0.3))'
                : '1px solid var(--color-success-border, rgba(16, 185, 129, 0.3))',
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: financials.isDeficit
                      ? 'var(--color-error, #dc2626)'
                      : 'var(--color-success, #059669)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Available Limit
                </span>
                <span
                  data-testid="badge-available-status"
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: financials.isDeficit
                      ? 'var(--color-error, #dc2626)'
                      : 'var(--color-success, #059669)',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: 'var(--border-radius-pill)',
                  }}
                >
                  {financials.isDeficit ? 'Deficit Warning' : 'Available'}
                </span>
              </div>
              <div
                data-testid="value-available-limit"
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 700,
                  color: financials.isDeficit
                    ? 'var(--color-error, #dc2626)'
                    : 'var(--color-success, #059669)',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrencyAmount(financials.availableLimit, financials.currency)}
              </div>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: financials.isDeficit
                  ? 'var(--color-error, #dc2626)'
                  : 'var(--color-success, #059669)',
                marginTop: 'var(--spacing-sm)',
              }}
            >
              {financials.isDeficit
                ? 'Credit limit exceeded — settlement required'
                : 'Available headroom for booking dispatches'}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
