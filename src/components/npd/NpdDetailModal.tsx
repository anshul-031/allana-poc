'use client';

import React from 'react';
import { CustomProductRequestDTO } from '@/server/actions/npd.actions';
import NpdStatusTimeline from './NpdStatusTimeline';

export interface NpdDetailModalProps {
  request: CustomProductRequestDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NpdDetailModal({ request, isOpen, onClose }: NpdDetailModalProps) {
  if (!isOpen || !request) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          bg: 'var(--color-success-bg, #f0fdf4)',
          text: 'var(--color-success-text, #166534)',
          border: 'var(--color-success-border, #bbf7d0)',
          label: 'Accepted',
        };
      case 'DECLINED':
        return {
          bg: 'var(--color-danger-bg, #fef2f2)',
          text: 'var(--color-danger-text, #991b1b)',
          border: 'var(--color-danger-border, #fecaca)',
          label: 'Declined',
        };
      case 'ANALYSIS':
        return {
          bg: 'rgba(197, 160, 89, 0.1)',
          text: 'var(--color-gold-700, #9c7b39)',
          border: 'var(--color-gold, #c5a059)',
          label: 'Under Analysis',
        };
      default:
        return {
          bg: 'var(--color-info-bg, #eff6ff)',
          text: 'var(--color-info-text, #1e40af)',
          border: 'var(--color-info-border, #bfdbfe)',
          label: 'In Review',
        };
    }
  };

  const badge = getStatusBadge(request.status);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="npd-modal-title"
      data-testid="npd-detail-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3
                id="npd-modal-title"
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--color-primary-dark, #0a192f)',
                }}
              >
                Ticket: {request.requestNumber}
              </h3>
              <span
                data-testid="modal-status-badge"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: badge.bg,
                  color: badge.text,
                  border: `1px solid ${badge.border}`,
                  padding: '3px 10px',
                  borderRadius: 'var(--border-radius-pill, 9999px)',
                  textTransform: 'uppercase',
                }}
              >
                {badge.label}
              </span>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary, #64748b)',
                marginTop: '4px',
              }}
            >
              Category: {request.categoryName} &bull; Target Market: {request.targetCountry}
            </div>
          </div>

          <button
            type="button"
            data-testid="close-npd-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: 'var(--color-slate-400, #94a3b8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Status Timeline */}
          <NpdStatusTimeline status={request.status} />

          {/* Manager Technical Feedback */}
          <div
            data-testid="manager-feedback-card"
            style={{
              backgroundColor: request.managerComments
                ? 'var(--color-background-subtle, #f8fafc)'
                : 'var(--color-info-bg, #eff6ff)',
              border: `1px solid ${
                request.managerComments
                  ? 'var(--color-gold, #c5a059)'
                  : 'var(--color-info-border, #bfdbfe)'
              }`,
              borderRadius: 'var(--border-radius-lg, 12px)',
              padding: '16px 18px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary-dark, #0a192f)',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>💬</span> Technical Assessment &amp; Manager Feedback
            </div>
            <p
              data-testid="manager-comments-text"
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary, #475569)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {request.managerComments ||
                'R&D team has received your ticket and is conducting initial cut yield and packaging feasibility analysis. Technical notes will appear here once finalized.'}
            </p>
          </div>

          {/* Meat Processing Criteria Badges */}
          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-text-tertiary, #94a3b8)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              Meat Processing Criteria
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span
                data-testid="criteria-calibrated"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: request.isCalibrated
                    ? 'var(--color-success-bg, #f0fdf4)'
                    : 'var(--color-slate-100, #f1f5f9)',
                  color: request.isCalibrated
                    ? 'var(--color-success-text, #166534)'
                    : 'var(--color-slate-500, #64748b)',
                  border: `1px solid ${
                    request.isCalibrated
                      ? 'var(--color-success-border, #bbf7d0)'
                      : 'var(--color-slate-200, #e2e8f0)'
                  }`,
                }}
              >
                {request.isCalibrated ? '✓ Calibrated' : '- Calibrated'}
              </span>

              <span
                data-testid="criteria-marinated"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: request.isMarinated
                    ? 'var(--color-success-bg, #f0fdf4)'
                    : 'var(--color-slate-100, #f1f5f9)',
                  color: request.isMarinated
                    ? 'var(--color-success-text, #166534)'
                    : 'var(--color-slate-500, #64748b)',
                  border: `1px solid ${
                    request.isMarinated
                      ? 'var(--color-success-border, #bbf7d0)'
                      : 'var(--color-slate-200, #e2e8f0)'
                  }`,
                }}
              >
                {request.isMarinated ? '✓ Marinated' : '- Marinated'}
              </span>

              <span
                data-testid="criteria-boneless"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: request.isBoneless
                    ? 'var(--color-success-bg, #f0fdf4)'
                    : 'var(--color-slate-100, #f1f5f9)',
                  color: request.isBoneless
                    ? 'var(--color-success-text, #166534)'
                    : 'var(--color-slate-500, #64748b)',
                  border: `1px solid ${
                    request.isBoneless
                      ? 'var(--color-success-border, #bbf7d0)'
                      : 'var(--color-slate-200, #e2e8f0)'
                  }`,
                }}
              >
                {request.isBoneless ? '✓ Boneless' : '- Boneless'}
              </span>

              <span
                data-testid="criteria-skinless"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: request.isSkinless
                    ? 'var(--color-success-bg, #f0fdf4)'
                    : 'var(--color-slate-100, #f1f5f9)',
                  color: request.isSkinless
                    ? 'var(--color-success-text, #166534)'
                    : 'var(--color-slate-500, #64748b)',
                  border: `1px solid ${
                    request.isSkinless
                      ? 'var(--color-success-border, #bbf7d0)'
                      : 'var(--color-slate-200, #e2e8f0)'
                  }`,
                }}
              >
                {request.isSkinless ? '✓ Skinless / Defatted' : '- Skinless / Defatted'}
              </span>

              <span
                data-testid="criteria-spec"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: request.hasSpecification
                    ? 'var(--color-success-bg, #f0fdf4)'
                    : 'var(--color-slate-100, #f1f5f9)',
                  color: request.hasSpecification
                    ? 'var(--color-success-text, #166534)'
                    : 'var(--color-slate-500, #64748b)',
                  border: `1px solid ${
                    request.hasSpecification
                      ? 'var(--color-success-border, #bbf7d0)'
                      : 'var(--color-slate-200, #e2e8f0)'
                  }`,
                }}
              >
                {request.hasSpecification ? '✓ Spec Attached' : '- No Spec Attached'}
              </span>
            </div>
          </div>

          {/* Specifications Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              backgroundColor: 'var(--color-background-subtle, #f8fafc)',
              padding: '16px',
              borderRadius: 'var(--border-radius-lg, 12px)',
              border: '1px solid var(--color-border-subtle, #e2e8f0)',
              marginBottom: '20px',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Cut Specification
              </span>
              <strong
                data-testid="modal-cut-spec"
                style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}
              >
                {request.cutSpecification || 'Standard export primal cut'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Recipe / Formulation Notes
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}>
                {request.recipeNotes || 'None specified'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Packaging Format &amp; Weight
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}>
                {request.packagingFormat || 'Master Carton'} ({request.individualPackagingWeight || 'Standard'})
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Freezing Technology
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}>
                {request.freezingType.replace('_', ' ')}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Estimated FCA Price
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-gold, #c5a059)' }}>
                {request.estimatedFcaPricePerTon
                  ? `$${request.estimatedFcaPricePerTon.toLocaleString()} / MT`
                  : 'Pending quotation'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Target Order Volume
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}>
                {request.targetVolumeMt ? `${request.targetVolumeMt} MT` : 'Sample consignment'}
              </strong>
            </div>
          </div>

          {/* Attached Document Link */}
          {request.attachmentUrl && (
            <div style={{ marginBottom: '16px' }}>
              <a
                href={request.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="modal-attachment-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-info-text, #1e40af)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>📎</span> Download Attached Artwork / Technical Spec
              </a>
            </div>
          )}

          {/* Metadata Footer */}
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-tertiary, #94a3b8)',
              borderTop: '1px solid var(--color-border-subtle, #e2e8f0)',
              paddingTop: '12px',
            }}
          >
            Submitted by: <strong>{request.createdByName}</strong> on{' '}
            {new Date(request.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
