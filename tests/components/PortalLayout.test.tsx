import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PortalLayout from '@/app/(portal)/layout';

vi.mock('@/components/common/Header', () => ({
  default: () => <header data-testid="mock-header">Portal Header</header>,
}));

vi.mock('@/components/common/BrandShowcase', () => ({
  default: () => <section data-testid="mock-brand-showcase">Brand Portfolio</section>,
}));

vi.mock('@/components/common/Footer', () => ({
  default: () => <footer data-testid="mock-footer">Portal Footer</footer>,
}));

describe('PortalLayout Shell Component (FEAT-2.1)', () => {
  it('renders header, main content children, brand showcase strip, and footer', () => {
    render(
      <PortalLayout>
        <div data-testid="child-content">Active Page Content</div>
      </PortalLayout>
    );

    expect(screen.getByTestId('portal-layout-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toHaveTextContent('Active Page Content');
    expect(screen.getByTestId('mock-brand-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });
});
