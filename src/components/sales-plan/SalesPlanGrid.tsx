'use client';

import React, { useState } from 'react';
import {
  CountryGroup,
  SalesPlanSummary,
  ShipToGroup,
  SkuPlanItem,
  UnitOfMeasureType,
  formatMetricValue,
} from '@/lib/sales-plan-calc';

export interface SalesPlanGridProps {
  summary: SalesPlanSummary;
  uom: UnitOfMeasureType;
}

export default function SalesPlanGrid({ summary, uom }: SalesPlanGridProps) {
  // Track expanded state for Country groups (default all expanded)
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const c of summary.countries) {
      init[c.country] = true;
    }
    return init;
  });

  // Track expanded state for Ship-To groups (default all expanded)
  const [expandedShipTo, setExpandedShipTo] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const c of summary.countries) {
      for (const s of c.shipToGroups) {
        init[`${c.country}::${s.shipToParty}`] = true;
      }
    }
    return init;
  });

  const toggleCountry = (country: string) => {
    setExpandedCountries((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  const toggleShipTo = (key: string) => {
    setExpandedShipTo((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!summary.countries || summary.countries.length === 0) {
    return (
      <div
        data-testid="sales-plan-empty-state"
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--color-border, #e2e8f0)',
          color: 'var(--color-text-secondary, #64748b)',
        }}
      >
        <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>
          No sales forecasting data found
        </p>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Try selecting a different Month, Year, Country, or Sales Organization in the filter bar above.
        </p>
      </div>
    );
  }

  const { grandTotal } = summary;

  return (
    <div
      data-testid="sales-plan-grid"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--color-border, #e2e8f0)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
          }}
        >
          {/* Table Header */}
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid var(--color-border, #e2e8f0)',
              }}
            >
              <th
                style={{
                  padding: '16px 20px',
                  color: 'var(--color-primary-dark, #0a192f)',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  minWidth: '280px',
                }}
              >
                Destination / SKU Item
              </th>
              <th
                style={{
                  padding: '16px 16px',
                  color: 'var(--color-primary-dark, #0a192f)',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  textAlign: 'right',
                  minWidth: '120px',
                }}
              >
                Target
              </th>
              <th
                style={{
                  padding: '16px 16px',
                  color: 'var(--color-primary-dark, #0a192f)',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  textAlign: 'right',
                  minWidth: '130px',
                }}
              >
                Last Month Transfer
              </th>
              <th
                style={{
                  padding: '16px 16px',
                  color: 'var(--color-primary-dark, #0a192f)',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  textAlign: 'right',
                  minWidth: '120px',
                }}
              >
                Shipped
              </th>
              <th
                style={{
                  padding: '16px 16px',
                  color: 'var(--color-primary-dark, #0a192f)',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  textAlign: 'right',
                  minWidth: '140px',
                }}
              >
                Order in the Pipeline
              </th>
              <th
                style={{
                  padding: '16px 20px',
                  color: 'var(--color-primary-dark, #0a192f)',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  textAlign: 'right',
                  minWidth: '160px',
                }}
              >
                Delta between Target and Shipped
              </th>
            </tr>
          </thead>

          <tbody>
            {summary.countries.map((countryGroup: CountryGroup) => {
              const isCountryExpanded = expandedCountries[countryGroup.country] !== false;
              const countryTotals = countryGroup.totals;

              const targetVal = uom === 'USD' ? countryTotals.targetUsd : countryTotals.targetTonnes;
              const lastMonthVal =
                uom === 'USD'
                  ? countryTotals.lastMonthBalanceUsd
                  : countryTotals.lastMonthBalanceTonnes;
              const shippedVal = uom === 'USD' ? countryTotals.shippedUsd : countryTotals.shippedTonnes;
              const pipelineVal =
                uom === 'USD' ? countryTotals.pipelineUsd : countryTotals.pipelineTonnes;
              const deltaVal = uom === 'USD' ? countryTotals.deltaUsd : countryTotals.deltaTonnes;
              const isSurplus = deltaVal >= 0;

              return (
                <React.Fragment key={countryGroup.country}>
                  {/* Tier 1: Country Master Row */}
                  <tr
                    data-testid={`country-row-${countryGroup.country}`}
                    style={{
                      backgroundColor: '#f1f5f9',
                      borderBottom: '1px solid var(--color-border, #cbd5e1)',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          data-testid={`toggle-country-btn-${countryGroup.country}`}
                          onClick={() => toggleCountry(countryGroup.country)}
                          style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--color-primary, #0f2b48)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#e2e8f0',
                          }}
                        >
                          {isCountryExpanded ? 'Hide Details ▴' : 'Details ▾'}
                        </button>

                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '14px',
                            color: 'var(--color-primary-dark, #0a192f)',
                          }}
                        >
                          {countryGroup.country}
                        </span>

                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary, #64748b)',
                            backgroundColor: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border, #cbd5e1)',
                          }}
                        >
                          {countryTotals.totalSkus} SKUs
                        </span>
                      </div>
                    </td>

                    {/* Target */}
                    <td
                      style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: 'var(--color-primary-dark, #0a192f)',
                      }}
                    >
                      {formatMetricValue(targetVal, uom)}
                    </td>

                    {/* Last Month Transfer */}
                    <td
                      style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary, #64748b)',
                      }}
                    >
                      {formatMetricValue(lastMonthVal, uom)}
                    </td>

                    {/* Shipped */}
                    <td
                      style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: 'var(--color-primary-dark, #0a192f)',
                      }}
                    >
                      {formatMetricValue(shippedVal, uom)}
                    </td>

                    {/* Pipeline */}
                    <td
                      style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary, #64748b)',
                      }}
                    >
                      {formatMetricValue(pipelineVal, uom)}
                    </td>

                    {/* Delta with Surplus/Deficit badge */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <span
                        data-testid={`country-delta-badge-${countryGroup.country}`}
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontWeight: 800,
                          fontSize: '12px',
                          backgroundColor: isSurplus ? '#dcfce7' : '#fee2e2',
                          color: isSurplus ? '#15803d' : '#b91c1c',
                          border: isSurplus ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        }}
                      >
                        {formatMetricValue(deltaVal, uom, true)}
                      </span>
                    </td>
                  </tr>

                  {/* Tier 2: Ship-To Party Rows */}
                  {isCountryExpanded &&
                    countryGroup.shipToGroups.map((shipToGroup: ShipToGroup) => {
                      const shipToKey = `${countryGroup.country}::${shipToGroup.shipToParty}`;
                      const isShipToExpanded = expandedShipTo[shipToKey] !== false;
                      const shipTotals = shipToGroup.totals;

                      const sTargetVal =
                        uom === 'USD' ? shipTotals.targetUsd : shipTotals.targetTonnes;
                      const sLastMonthVal =
                        uom === 'USD'
                          ? shipTotals.lastMonthBalanceUsd
                          : shipTotals.lastMonthBalanceTonnes;
                      const sShippedVal =
                        uom === 'USD' ? shipTotals.shippedUsd : shipTotals.shippedTonnes;
                      const sPipelineVal =
                        uom === 'USD' ? shipTotals.pipelineUsd : shipTotals.pipelineTonnes;
                      const sDeltaVal =
                        uom === 'USD' ? shipTotals.deltaUsd : shipTotals.deltaTonnes;
                      const sIsSurplus = sDeltaVal >= 0;

                      return (
                        <React.Fragment key={shipToKey}>
                          {/* Ship-To Summary Row */}
                          <tr
                            data-testid={`shipto-row-${shipToGroup.shipToParty}`}
                            style={{
                              backgroundColor: '#ffffff',
                              borderBottom: '1px solid var(--color-border, #e2e8f0)',
                            }}
                          >
                            <td style={{ padding: '12px 20px 12px 36px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  data-testid={`toggle-skus-btn-${shipToGroup.shipToParty}`}
                                  onClick={() => toggleShipTo(shipToKey)}
                                  style={{
                                    border: '1px solid var(--color-border, #cbd5e1)',
                                    borderRadius: '6px',
                                    padding: '3px 8px',
                                    backgroundColor: '#f8fafc',
                                    color: 'var(--color-primary-dark, #0a192f)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  {isShipToExpanded ? '▲' : '▼'} {shipToGroup.items.length} SKU
                                </button>

                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    color: 'var(--color-primary, #0f2b48)',
                                  }}
                                >
                                  {shipToGroup.shipToParty}
                                </span>
                              </div>
                            </td>

                            <td
                              style={{
                                padding: '12px 16px',
                                textAlign: 'right',
                                fontWeight: 600,
                                color: 'var(--color-primary-dark, #0a192f)',
                              }}
                            >
                              {formatMetricValue(sTargetVal, uom)}
                            </td>

                            <td
                              style={{
                                padding: '12px 16px',
                                textAlign: 'right',
                                color: 'var(--color-text-secondary, #64748b)',
                              }}
                            >
                              {formatMetricValue(sLastMonthVal, uom)}
                            </td>

                            <td
                              style={{
                                padding: '12px 16px',
                                textAlign: 'right',
                                fontWeight: 600,
                                color: 'var(--color-primary-dark, #0a192f)',
                              }}
                            >
                              {formatMetricValue(sShippedVal, uom)}
                            </td>

                            <td
                              style={{
                                padding: '12px 16px',
                                textAlign: 'right',
                                color: 'var(--color-text-secondary, #64748b)',
                              }}
                            >
                              {formatMetricValue(sPipelineVal, uom)}
                            </td>

                            <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                              <span
                                data-testid={`shipto-delta-badge-${shipToGroup.shipToParty}`}
                                style={{
                                  display: 'inline-block',
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  backgroundColor: sIsSurplus ? '#dcfce7' : '#fee2e2',
                                  color: sIsSurplus ? '#15803d' : '#b91c1c',
                                }}
                              >
                                {formatMetricValue(sDeltaVal, uom, true)}
                              </span>
                            </td>
                          </tr>

                          {/* Tier 3: SKU Lines */}
                          {isShipToExpanded &&
                            shipToGroup.items.map((item: SkuPlanItem) => {
                              const iTargetVal =
                                uom === 'USD' ? item.targetUsd : item.targetTonnes;
                              const iLastMonthVal =
                                uom === 'USD'
                                  ? item.lastMonthBalanceUsd
                                  : item.lastMonthBalanceTonnes;
                              const iShippedVal =
                                uom === 'USD' ? item.shippedUsd : item.shippedTonnes;
                              const iPipelineVal =
                                uom === 'USD' ? item.pipelineUsd : item.pipelineTonnes;
                              const iDeltaVal =
                                uom === 'USD' ? item.deltaUsd : item.deltaTonnes;
                              const iIsSurplus = iDeltaVal >= 0;

                              return (
                                <tr
                                  key={item.id}
                                  data-testid={`sku-row-${item.sku}`}
                                  style={{
                                    backgroundColor: '#fafbfc',
                                    borderBottom: '1px solid #f1f5f9',
                                    fontSize: '12px',
                                  }}
                                >
                                  <td style={{ padding: '10px 20px 10px 56px' }}>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: '8px',
                                      }}
                                    >
                                      <span
                                        style={{
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          backgroundColor: '#e2e8f0',
                                          color: 'var(--color-primary-dark, #0a192f)',
                                          fontSize: '10px',
                                          fontWeight: 700,
                                        }}
                                      >
                                        {item.sku}
                                      </span>
                                      <span
                                        style={{
                                          color: 'var(--color-text-secondary, #475569)',
                                          fontWeight: 500,
                                        }}
                                      >
                                        {item.skuName}
                                      </span>
                                    </div>
                                  </td>

                                  <td
                                    style={{
                                      padding: '10px 16px',
                                      textAlign: 'right',
                                      color: 'var(--color-primary-dark, #0a192f)',
                                    }}
                                  >
                                    {formatMetricValue(iTargetVal, uom)}
                                  </td>

                                  <td
                                    style={{
                                      padding: '10px 16px',
                                      textAlign: 'right',
                                      color: 'var(--color-text-secondary, #64748b)',
                                    }}
                                  >
                                    {formatMetricValue(iLastMonthVal, uom)}
                                  </td>

                                  <td
                                    style={{
                                      padding: '10px 16px',
                                      textAlign: 'right',
                                      color: 'var(--color-primary-dark, #0a192f)',
                                    }}
                                  >
                                    {formatMetricValue(iShippedVal, uom)}
                                  </td>

                                  <td
                                    style={{
                                      padding: '10px 16px',
                                      textAlign: 'right',
                                      color: 'var(--color-text-secondary, #64748b)',
                                    }}
                                  >
                                    {formatMetricValue(iPipelineVal, uom)}
                                  </td>

                                  <td style={{ padding: '10px 20px', textAlign: 'right' }}>
                                    <span
                                      data-testid={`sku-delta-badge-${item.sku}`}
                                      style={{
                                        display: 'inline-block',
                                        padding: '2px 6px',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        backgroundColor: iIsSurplus ? '#f0fdf4' : '#fef2f2',
                                        color: iIsSurplus ? '#16a34a' : '#dc2626',
                                      }}
                                    >
                                      {formatMetricValue(iDeltaVal, uom, true)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Grand Total Footer */}
          <tfoot>
            <tr
              data-testid="grand-total-row"
              style={{
                backgroundColor: 'var(--color-primary-dark, #0a192f)',
                color: '#ffffff',
                borderTop: '2px solid var(--color-gold, #c5a059)',
                fontWeight: 800,
              }}
            >
              <td style={{ padding: '18px 20px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-gold, #c5a059)',
                    }}
                  />
                  <span>GRAND TOTAL ({grandTotal.totalCountries} COUNTRIES)</span>
                </div>
              </td>

              <td
                data-testid="grand-total-target"
                style={{ padding: '18px 16px', textAlign: 'right', fontSize: '14px' }}
              >
                {formatMetricValue(
                  uom === 'USD' ? grandTotal.targetUsd : grandTotal.targetTonnes,
                  uom
                )}
              </td>

              <td
                data-testid="grand-total-lastmonth"
                style={{
                  padding: '18px 16px',
                  textAlign: 'right',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '13px',
                }}
              >
                {formatMetricValue(
                  uom === 'USD'
                    ? grandTotal.lastMonthBalanceUsd
                    : grandTotal.lastMonthBalanceTonnes,
                  uom
                )}
              </td>

              <td
                data-testid="grand-total-shipped"
                style={{ padding: '18px 16px', textAlign: 'right', fontSize: '14px' }}
              >
                {formatMetricValue(
                  uom === 'USD' ? grandTotal.shippedUsd : grandTotal.shippedTonnes,
                  uom
                )}
              </td>

              <td
                data-testid="grand-total-pipeline"
                style={{
                  padding: '18px 16px',
                  textAlign: 'right',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '13px',
                }}
              >
                {formatMetricValue(
                  uom === 'USD' ? grandTotal.pipelineUsd : grandTotal.pipelineTonnes,
                  uom
                )}
              </td>

              <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                <span
                  data-testid="grand-total-delta"
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '12px',
                    backgroundColor:
                      (uom === 'USD' ? grandTotal.deltaUsd : grandTotal.deltaTonnes) >= 0
                        ? '#dcfce7'
                        : '#fee2e2',
                    color:
                      (uom === 'USD' ? grandTotal.deltaUsd : grandTotal.deltaTonnes) >= 0
                        ? '#15803d'
                        : '#b91c1c',
                  }}
                >
                  {formatMetricValue(
                    uom === 'USD' ? grandTotal.deltaUsd : grandTotal.deltaTonnes,
                    uom,
                    true
                  )}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
