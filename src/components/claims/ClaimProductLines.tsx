'use client';

import React, { useState } from 'react';
import { ClaimProductLineInput } from '@/server/validators/claim.schema';
import { lookupProductByArticle } from '@/server/actions/claims.actions';

interface ClaimProductLinesProps {
  lines: ClaimProductLineInput[];
  onChange: (lines: ClaimProductLineInput[]) => void;
  error?: string;
}

export const ClaimProductLines: React.FC<ClaimProductLinesProps> = ({
  lines,
  onChange,
  error,
}) => {
  const [lookingUpIndex, setLookingUpIndex] = useState<number | null>(null);

  const addLine = () => {
    if (lines.length >= 10) return;
    onChange([
      ...lines,
      {
        productArticle: '',
        productName: '',
        producerName: '',
        country: '',
        productionDate: '',
        lotNumber: '',
        vehicleNumber: '',
        nonConformWeightKg: 0,
        receivedQuantityKg: null,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    const updated = lines.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateLine = (index: number, field: keyof ClaimProductLineInput, value: any) => {
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleArticleBlur = async (index: number, article: string) => {
    const trimmed = article.trim();
    if (!trimmed) return;

    setLookingUpIndex(index);
    try {
      const res = await lookupProductByArticle(trimmed);
      if (res.success && res.product) {
        updateLine(index, 'productName', res.product.name);
      }
    } catch {
      // Ignore lookup error, user can still type product name manually
    } finally {
      setLookingUpIndex(null);
    }
  };

  const totalNonConformWeight = lines.reduce(
    (sum, line) => sum + (Number(line.nonConformWeightKg) || 0),
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-primary-900)',
              margin: '0 0 0.25rem 0',
            }}
          >
            Product Lines ({lines.length}/10)
          </h3>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
            Enter product article code to auto-populate product name. Specify exact weights to 4 decimal places.
          </p>
        </div>

        <button
          type="button"
          data-testid="add-product-line-btn"
          disabled={lines.length >= 10}
          onClick={addLine}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor:
              lines.length >= 10 ? 'var(--color-slate-200)' : 'var(--color-primary-600)',
            color: lines.length >= 10 ? 'var(--color-slate-400)' : 'var(--color-white)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: 'none',
            cursor: lines.length >= 10 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>+</span>
          <span>Add Product Line</span>
        </button>
      </div>

      {error && (
        <div
          data-testid="product-lines-error"
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            fontSize: '0.8125rem',
            border: '1px solid var(--color-danger-border)',
          }}
        >
          {error}
        </div>
      )}

      {/* Product Rows List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lines.map((line, idx) => (
          <div
            key={idx}
            data-testid={`product-line-${idx}`}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-200)',
              backgroundColor: 'var(--color-white)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              position: 'relative',
            }}
          >
            {/* Row Header with index and delete button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--color-slate-100)',
              }}
            >
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-700)',
                }}
              >
                Line #{idx + 1}
              </span>

              {lines.length > 1 && (
                <button
                  type="button"
                  data-testid={`remove-line-${idx}`}
                  onClick={() => removeLine(idx)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  ✕ Remove Line
                </button>
              )}
            </div>

            {/* Grid of inputs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {/* Product Article */}
              <div>
                <label
                  htmlFor={`article-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Product Article *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id={`article-input-${idx}`}
                    type="text"
                    data-testid={`article-input-${idx}`}
                    placeholder="e.g. 7940 or 8320"
                    value={line.productArticle}
                    onChange={(e) => updateLine(idx, 'productArticle', e.target.value)}
                    onBlur={(e) => handleArticleBlur(idx, e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.8125rem',
                    }}
                  />
                  {lookingUpIndex === idx && (
                    <span
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.75rem',
                        color: 'var(--color-primary-600)',
                      }}
                    >
                      Searching...
                    </span>
                  )}
                </div>
              </div>

              {/* Product Name */}
              <div style={{ gridColumn: 'span 2' }}>
                <label
                  htmlFor={`name-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Product Name *
                </label>
                <input
                  id={`name-input-${idx}`}
                  type="text"
                  data-testid={`name-input-${idx}`}
                  placeholder="Auto-populated or enter product name"
                  value={line.productName}
                  onChange={(e) => updateLine(idx, 'productName', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              {/* Producer Name */}
              <div>
                <label
                  htmlFor={`producer-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Producer / Plant
                </label>
                <input
                  id={`producer-input-${idx}`}
                  type="text"
                  placeholder="e.g. Allana Plant 4"
                  value={line.producerName || ''}
                  onChange={(e) => updateLine(idx, 'producerName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor={`country-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Country
                </label>
                <input
                  id={`country-input-${idx}`}
                  type="text"
                  placeholder="e.g. India"
                  value={line.country || ''}
                  onChange={(e) => updateLine(idx, 'country', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              {/* Production Date */}
              <div>
                <label
                  htmlFor={`prod-date-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Production Date
                </label>
                <input
                  id={`prod-date-input-${idx}`}
                  type="date"
                  value={line.productionDate || ''}
                  onChange={(e) => updateLine(idx, 'productionDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              {/* Lot / Batch */}
              <div>
                <label
                  htmlFor={`lot-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Lot / Batch No.
                </label>
                <input
                  id={`lot-input-${idx}`}
                  type="text"
                  placeholder="e.g. LOT-2026-B91"
                  value={line.lotNumber || ''}
                  onChange={(e) => updateLine(idx, 'lotNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              {/* Vehicle Number (User Manual max 100 chars) */}
              <div>
                <label
                  htmlFor={`vehicle-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Vehicle No. (max 100)
                </label>
                <input
                  id={`vehicle-input-${idx}`}
                  type="text"
                  data-testid={`vehicle-input-${idx}`}
                  placeholder="e.g. TRUCK-MH-04-1290"
                  maxLength={100}
                  value={line.vehicleNumber || ''}
                  onChange={(e) => updateLine(idx, 'vehicleNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              {/* Non-Conform Weight (kg) - 4-decimal precision */}
              <div>
                <label
                  htmlFor={`nonconform-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-danger-text)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Non-Conform Weight (kg) *
                </label>
                <input
                  id={`nonconform-input-${idx}`}
                  type="number"
                  data-testid={`nonconform-input-${idx}`}
                  step="0.0001"
                  min="0.0001"
                  placeholder="00.0000"
                  value={line.nonConformWeightKg || ''}
                  onChange={(e) =>
                    updateLine(idx, 'nonConformWeightKg', parseFloat(e.target.value) || 0)
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-danger-border)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-danger-text)',
                  }}
                />
              </div>

              {/* Received Qty (kg) */}
              <div>
                <label
                  htmlFor={`received-input-${idx}`}
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Received Qty (kg)
                </label>
                <input
                  id={`received-input-${idx}`}
                  type="number"
                  step="0.0001"
                  placeholder="00.0000"
                  value={line.receivedQuantityKg != null ? line.receivedQuantityKg : ''}
                  onChange={(e) =>
                    updateLine(
                      idx,
                      'receivedQuantityKg',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weight Summary Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-slate-50)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-slate-200)',
          fontSize: '0.875rem',
        }}
      >
        <span style={{ color: 'var(--color-slate-600)', marginRight: '0.5rem' }}>
          Total Non-Conforming Weight:
        </span>
        <strong
          data-testid="total-weight-summary"
          style={{ color: 'var(--color-danger-text)', fontSize: '1rem' }}
        >
          {totalNonConformWeight.toFixed(4)} kg
        </strong>
      </div>
    </div>
  );
};
