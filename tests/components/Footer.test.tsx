import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Footer from '@/components/common/Footer';

describe('Footer Component (src/components/common/Footer.tsx)', () => {
  it('renders copyright and certifications subtext', () => {
    render(<Footer />);
    expect(screen.getByText(/2026 Allanasons Private Limited/i)).toBeInTheDocument();
    expect(screen.getByText(/SFDA Approved/i)).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Twitter / X')).toBeInTheDocument();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('renders functional footer links: terms, manual download, and Help & Support', () => {
    render(<Footer />);
    expect(screen.getByText('General terms and conditions')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
  });
});
