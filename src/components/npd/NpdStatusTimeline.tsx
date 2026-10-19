'use client';

import React from 'react';
import { CustomProductStatus } from '@/server/actions/npd.actions';

export interface NpdStatusTimelineProps {
  status: CustomProductStatus;
}

export default function NpdStatusTimeline({ status }: NpdStatusTimelineProps) {
  const isDeclined = status === 'DECLINED';

  const steps = [
    {
      id: 'IN_REVIEW',
      title: '1. In Review',
      description: 'R&D Desk Initial Screening',
      isCompleted: status === 'ANALYSIS' || status === 'ACCEPTED',
      isActive: status === 'IN_REVIEW',
    },
    {
      id: 'ANALYSIS',
      title: '2. Technical Analysis',
      description: 'Plant Feasibility & Yield',
      isCompleted: status === 'ACCEPTED',
      isActive: status === 'ANALYSIS',
    },
    {
      id: isDeclined ? 'DECLINED' : 'ACCEPTED',
      title: isDeclined ? '3. Declined' : '3. Accepted',
      description: isDeclined ? 'Specification Unviable' : 'Approved for Export Production',
      isCompleted: status === 'ACCEPTED',
      isActive: status === 'ACCEPTED' || isDeclined,
      isDeclined,
    },
  ];

  return (
    <div
      data-testid="npd-status-timeline"
      style={{
        padding: '16px 20px',
        backgroundColor: 'var(--color-background-subtle, #f8fafc)',
        borderRadius: 'var(--border-radius-lg, 12px)',
        border: '1px solid var(--color-border, #e2e8f0)',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {steps.map((step, idx) => {
          const isDone = step.isCompleted;
          const isCurrent = step.isActive;
          const isStepDeclined = step.isDeclined;

          let badgeBg = 'var(--color-slate-200, #e2e8f0)';
          let badgeColor = 'var(--color-slate-600, #475569)';
          let borderColor = 'var(--color-slate-300, #cbd5e1)';

          if (isStepDeclined) {
            badgeBg = 'var(--color-danger-bg, #fef2f2)';
            badgeColor = 'var(--color-danger-text, #991b1b)';
            borderColor = 'var(--color-danger-border, #fecaca)';
          } else if (isDone) {
            badgeBg = 'var(--color-success-bg, #f0fdf4)';
            badgeColor = 'var(--color-success-text, #166534)';
            borderColor = 'var(--color-success-border, #bbf7d0)';
          } else if (isCurrent) {
            badgeBg = 'rgba(197, 160, 89, 0.15)';
            badgeColor = 'var(--color-primary-dark, #0a192f)';
            borderColor = 'var(--color-gold, #c5a059)';
          }

          return (
            <div
              key={step.id}
              data-testid={`timeline-step-${step.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flex: '1 1 200px',
              }}
            >
              {/* Step indicator circle */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: badgeBg,
                  border: `2px solid ${borderColor}`,
                  color: badgeColor,
                  fontWeight: 800,
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                {isStepDeclined ? '✕' : isDone ? '✓' : idx + 1}
              </div>

              {/* Step Title & Description */}
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isStepDeclined
                      ? 'var(--color-danger-text, #991b1b)'
                      : isCurrent
                      ? 'var(--color-primary-dark, #0a192f)'
                      : 'var(--color-text-secondary, #475569)',
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary, #94a3b8)',
                  }}
                >
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
