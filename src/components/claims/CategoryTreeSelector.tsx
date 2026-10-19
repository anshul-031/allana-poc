'use client';

import React from 'react';
import { InfoRequestCategory } from '@/server/actions/claims.actions';

export interface CategoryTreeGroup {
  groupName: string;
  items: {
    category: InfoRequestCategory;
    label: string;
    description: string;
  }[];
}

export const INFO_REQUEST_CATEGORY_GROUPS: CategoryTreeGroup[] = [
  {
    groupName: 'Questionnaires',
    items: [
      {
        category: 'QUESTIONNAIRE',
        label: 'Quality & Supplier Questionnaire',
        description: 'Standard supplier evaluation, vendor audit questionnaires, and compliance forms.',
      },
    ],
  },
  {
    groupName: 'Provision of Documents',
    items: [
      {
        category: 'DOCS_SPECIFICATION',
        label: 'Product Specification',
        description: 'Official cut specification sheets, butchery yield, and packaging parameters.',
      },
      {
        category: 'DOCS_SURVEY_REPORT',
        label: 'Survey / Inspection Report',
        description: 'Independent surveyor loading report, draft survey, or SGS tally sheets.',
      },
      {
        category: 'DOCS_CERTIFICATE',
        label: 'Regulatory Certificate',
        description: 'Veterinary health certificate, SFDA halal cert, or certificate of origin.',
      },
      {
        category: 'DOCS_DECLARATION_QUALITY',
        label: 'Declaration of Quality & Safety',
        description: 'Manufacturer declaration certifying conformity to export grade standards.',
      },
      {
        category: 'DOCS_DECLARATION_SHELF_LIFE',
        label: 'Shelf Life Extension Declaration',
        description: 'Formal manufacturer letter requesting customs shelf-life extension for delayed cargo.',
      },
      {
        category: 'DOCS_DECLARATION_LEGISLATION',
        label: 'Legislation Compliance Declaration',
        description: 'Conformity statement to importing country food laws (SFDA, GCC, Codex).',
      },
      {
        category: 'DOCS_DECLARATION_OTHER',
        label: 'Other Regulatory Declaration',
        description: 'Non-standard declarations, allergen statements, or packaging migration certificates.',
      },
    ],
  },
  {
    groupName: 'Other Inquiries',
    items: [
      {
        category: 'OTHER_QUALITY_SAFETY',
        label: 'Quality & Food Safety Question',
        description: 'Technical inquiries regarding microbiology, temperature thresholds, or processing.',
      },
      {
        category: 'OTHER_AUDIT',
        label: 'Audit / Inspection Request',
        description: 'Requests for physical plant audits, virtual tours, or SFDA inspection visits.',
      },
      {
        category: 'OTHER_CLARIFYING_INFO',
        label: 'Clarifying Information',
        description: 'General commercial, transport, or customs clarification questions.',
      },
    ],
  },
];

interface CategoryTreeSelectorProps {
  selectedCategory: InfoRequestCategory;
  onSelectCategory: (category: InfoRequestCategory) => void;
}

export const CategoryTreeSelector: React.FC<CategoryTreeSelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div
      data-testid="category-tree-selector"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {INFO_REQUEST_CATEGORY_GROUPS.map((group, groupIdx) => (
        <div key={groupIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-slate-500)',
              padding: '0.25rem 0.5rem',
            }}
          >
            {group.groupName}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {group.items.map((item) => {
              const isSelected = selectedCategory === item.category;

              return (
                <button
                  key={item.category}
                  type="button"
                  data-testid={`cat-btn-${item.category}`}
                  onClick={() => onSelectCategory(item.category)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${
                      isSelected ? 'var(--color-primary-600)' : 'var(--color-slate-200)'
                    }`,
                    backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--color-white)',
                    color: isSelected ? 'var(--color-primary-800)' : 'var(--color-slate-800)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 700 : 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>{isSelected ? '●' : '○'}</span>
                    <span>{item.label}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: isSelected ? 'var(--color-primary-700)' : 'var(--color-slate-500)',
                      marginTop: '0.2rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
