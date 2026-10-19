import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPresignedUploadUrl } from '@/lib/r2';

const uploadRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content-Type is required'),
  context: z.enum(['claims', 'custom-products', 'licenses', 'specs', 'general']).default('general'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = uploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid upload request', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fileName, contentType, context } = parsed.data;

    // Sanitize filename to prevent directory traversal
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const key = `${context}/${timestamp}-${safeName}`;

    const { uploadUrl } = await createPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key }, { status: 200 });
  } catch (error) {
    console.error('Failed to generate presigned upload URL:', error);
    return NextResponse.json(
      { error: 'Internal Server Error generating upload URL' },
      { status: 500 }
    );
  }
}
