import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import BrandShowcase from '@/components/common/BrandShowcase';

describe('BrandShowcase Component (src/components/common/BrandShowcase.tsx)', () => {
  it('renders section title and brand showcase container', () => {
    render(<BrandShowcase />);
    expect(screen.getByText('Allanasons Export Brands')).toBeInTheDocument();
    expect(screen.getByText('OUR TRUSTED GLOBAL PORTFOLIO')).toBeInTheDocument();
  });

  it('renders all four flagship export brands with taglines', () => {
    render(<BrandShowcase />);
    expect(screen.getByText('ALLANA')).toBeInTheDocument();
    expect(screen.getByText('AL-TAMAM')).toBeInTheDocument();
    expect(screen.getByText('OMAR')).toBeInTheDocument();
    expect(screen.getByText('PREMIUM GOLD')).toBeInTheDocument();

    expect(screen.getByText('World Leader in Buffalo Meat Exports')).toBeInTheDocument();
    expect(screen.getByText('Premium Chilled & Frozen Halal Cuts')).toBeInTheDocument();
  });
});
