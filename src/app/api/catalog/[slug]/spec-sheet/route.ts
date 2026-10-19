import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/server/actions/catalog.actions';
import { generateProductSpecSheetPdf } from '@/lib/pdf';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const result = await getProductBySlug(slug);

    if (!result.success || !result.product) {
      return NextResponse.json(
        { error: result.error || 'Product not found' },
        { status: 404 }
      );
    }

    const pdfBuffer = generateProductSpecSheetPdf(result.product);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Allana-Spec-${result.product.sku}.pdf"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
