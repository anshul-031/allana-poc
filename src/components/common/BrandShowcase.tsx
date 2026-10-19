'use client';

import React from 'react';

interface BrandItem {
  name: string;
  tagline: string;
  badge: string;
}

const BRANDS: BrandItem[] = [
  { name: 'ALLANA', tagline: 'World Leader in Buffalo Meat Exports', badge: 'Flagship' },
  { name: 'AL-TAMAM', tagline: 'Premium Chilled & Frozen Halal Cuts', badge: 'Halal Certified' },
  { name: 'OMAR', tagline: 'Finest Quality Selected Meat', badge: 'MEA Special' },
  { name: 'PREMIUM GOLD', tagline: 'VPCM & Calibrated Fine Cuts', badge: 'Reserve' },
];

export default function BrandShowcase() {
  return (
    <section className="brand-showcase-section" aria-label="Export Brands Portfolio">
      <div className="brand-showcase-container">
        <div className="brand-showcase-header">
          <span className="brand-showcase-kicker">OUR TRUSTED GLOBAL PORTFOLIO</span>
          <h3 className="brand-showcase-title">Allanasons Export Brands</h3>
        </div>
        <div className="brand-showcase-grid">
          {BRANDS.map((brand) => (
            <div key={brand.name} className="brand-card">
              <div className="brand-card-badge">{brand.badge}</div>
              <h4 className="brand-card-name">{brand.name}</h4>
              <p className="brand-card-tagline">{brand.tagline}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .brand-showcase-section {
          background: linear-gradient(180deg, #0f2342 0%, #0a192f 100%);
          color: #ffffff;
          padding: 2.5rem 1.5rem;
          border-top: 2px solid #c5a059;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .brand-showcase-container {
          max-width: 1380px;
          margin: 0 auto;
        }
        .brand-showcase-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .brand-showcase-kicker {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #c5a059;
          text-transform: uppercase;
        }
        .brand-showcase-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-top: 0.25rem;
        }
        .brand-showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        .brand-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(197, 160, 89, 0.25);
          border-radius: 8px;
          padding: 1.25rem;
          text-align: center;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
          position: relative;
        }
        .brand-card:hover {
          transform: translateY(-3px);
          border-color: #c5a059;
          background: rgba(255, 255, 255, 0.08);
        }
        .brand-card-badge {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #c5a059;
          background: rgba(197, 160, 89, 0.12);
          border: 1px solid rgba(197, 160, 89, 0.3);
          border-radius: 9999px;
          padding: 0.125rem 0.5rem;
          margin-bottom: 0.5rem;
        }
        .brand-card-name {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ffffff;
          margin-bottom: 0.35rem;
        }
        .brand-card-tagline {
          font-size: 0.8125rem;
          color: #94a3b8;
          line-height: 1.4;
        }
      `}</style>
    </section>
  );
}
