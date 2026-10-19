import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPresignedDownloadUrl } from '@/lib/r2';

const downloadRequestSchema = z.object({
  key: z.string().min(1, 'Storage key is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = downloadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid download request', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { key } = parsed.data;
    const downloadUrl = await createPresignedDownloadUrl(key);

    return NextResponse.json({ downloadUrl }, { status: 200 });
  } catch (error) {
    console.error('Failed to generate presigned download URL:', error);
    return NextResponse.json(
      { error: 'Internal Server Error generating download URL' },
      { status: 500 }
    );
  }
}
