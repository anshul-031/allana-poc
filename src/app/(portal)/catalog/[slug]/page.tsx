import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/server/actions/catalog.actions';
import ProductDetailView from '@/components/catalog/ProductDetailView';
import { FALLBACK_CATALOG_ITEMS } from '@/lib/fallback-catalog';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  let product = result.success && result.product ? result.product : null;

  if (!product) {
    const item = FALLBACK_CATALOG_ITEMS.find((p) => p.slug === slug);
    if (item) {
      product = {
        id: item.id,
        sku: item.sku,
        name: item.name,
        slug: item.slug,
        brand: item.brand,
        categoryName: item.categoryName,
        categorySlug: item.categorySlug,
        subcategoryName: item.subcategoryName,
        subcategorySlug: item.subcategorySlug,
        productState: item.productState,
        primaryPackaging: item.primaryPackaging,
        storageTemperature: item.storageTemperature,
        shelfLifeMonths: item.shelfLifeMonths,
        cartonNetWeightKg: item.cartonNetWeightKg,
        cutSize: item.cutSize,
        packagesPerCarton: item.packagesPerCarton,
        cartonWeightKg: item.cartonWeightKg,
        cartonDimensionsMm: item.cartonDimensionsMm,
        cartonsPerPallet: item.cartonsPerPallet,
        palletsPerContainer: item.palletsPerContainer,
        totalContainerWeightMt: item.totalContainerWeightMt,
        freezingType: item.freezingType,
        imageUrl: item.imageUrl,
        packagingImageUrl: item.packagingImageUrl,
        specSheetPdfUrl: item.specSheetPdfUrl,
        certifications: item.certifications,
        description: item.description,
        isUnderDevelopment: item.isUnderDevelopment,
        packagingOptions: [
          {
            id: 'vacuum-block',
            label: 'Vacuum Block (IWP)',
            format: 'Individually vacuum packed in food-grade multilayer barrier shrink film',
            imageUrl: item.packagingImageUrl,
          },
          {
            id: 'carton',
            label: 'Master Carton',
            format: 'Heavy-duty 5-ply corrugated export carton with strap reinforcement',
            imageUrl: item.packagingImageUrl,
          },
          {
            id: 'polybag',
            label: 'Polybag Bulk',
            format: 'Heavy-duty polyethylene liner inside corrugated master carton',
            imageUrl: 'products/packaging/sample-polybag.webp',
          },
          {
            id: 'tray',
            label: 'Retail MAP Tray',
            format: 'Skin-pack barrier tray in modified atmosphere packaging (MAP)',
            imageUrl: 'products/packaging/sample-tray.webp',
          },
        ],
      };
    }
  }

  if (!product) {
    return (
      <div
        data-testid="pdp-not-found"
        style={{
          maxWidth: '800px',
          margin: '60px auto',
          padding: '40px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h2
          style={{
            fontSize: 'var(--font-size-2xl, 24px)',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            marginBottom: '12px',
          }}
        >
          Product Specification Not Found
        </h2>
        <p
          style={{
            fontSize: 'var(--font-size-md, 15px)',
            color: 'var(--color-text-secondary, #64748b)',
            marginBottom: '24px',
          }}
        >
          The requested export product &ldquo;{slug}&rdquo; could not be retrieved from the catalog.
        </p>
        <Link
          href="/catalog"
          data-testid="return-to-catalog-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary-dark, #0a192f)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: 'var(--border-radius-lg, 10px)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 700,
            border: '1px solid var(--color-gold, #c5a059)',
          }}
        >
          &larr; Return to Product Catalog
        </Link>
      </div>
    );
  }

  return <ProductDetailView product={product} />;
}
