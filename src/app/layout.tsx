import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Allana Group | B2B Customer Export Portal',
  description: 'Enterprise B2B Customer Self-Service Portal for Allana Meat & Agro-Exports - Shipment Tracking, Digital SKU Catalog, NPD Requests, Financial Indicators and Claims.',
  keywords: ['Allana', 'Meat Export', 'Buffalo Meat', 'Shipment Tracking', 'B2B Export Portal', 'Halal Export', 'SFDA Approved'],
  authors: [{ name: 'Allanasons Private Limited' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
