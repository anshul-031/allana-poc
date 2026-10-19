import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TermsPage from '@/app/(portal)/terms/page';

describe('TermsPage Component (Footer Terms & Conditions)', () => {
  it('renders page title, subtitle, and breadcrumbs', () => {
    render(<TermsPage />);

    expect(screen.getByRole('heading', { level: 1, name: /General Export Terms & Conditions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Dashboard$/i })).toBeInTheDocument();
    expect(screen.getByText(/Commercial, Quality, and Cold Chain Governance/i)).toBeInTheDocument();

  });

  it('renders all key commercial and regulatory sections', () => {
    render(<TermsPage />);

    expect(screen.getByRole('heading', { level: 2, name: /1\. Scope & Applicable Regulatory Standards/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /2\. Delivery Terms & Incoterms 2020/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /3\. Cold Chain Integrity & Transport Standards/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /4\. Inspection, Claims & Non-Conformity Protocol/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /5\. Payment Terms & Credit Limits/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /6\. Customer Self-Service Portal & Data Security/i })).toBeInTheDocument();
  });

  it('renders navigation action buttons linking to Dashboard and Support', () => {
    render(<TermsPage />);

    const dashboardLink = screen.getByRole('link', { name: /Return to Dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/');

    const supportLink = screen.getByRole('link', { name: /Submit Inquiries & Support/i });
    expect(supportLink).toHaveAttribute('href', '/claims/new-request');
  });
});
