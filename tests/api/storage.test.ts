import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as handlePresignUpload } from '@/app/api/storage/presign-upload/route';
import { POST as handlePresignDownload } from '@/app/api/storage/presign-download/route';
import * as r2 from '@/lib/r2';
import { NextRequest } from 'next/server';

vi.mock('@/lib/r2', () => ({
  createPresignedUploadUrl: vi.fn(),
  createPresignedDownloadUrl: vi.fn(),
}));

describe('Storage API Route Handlers (/api/storage/*)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/storage/presign-upload', () => {
    it('generates presigned upload URL on valid request', async () => {
      vi.mocked(r2.createPresignedUploadUrl).mockResolvedValueOnce({
        uploadUrl: 'https://r2.mock/upload?signed=true',
        key: 'claims/test.pdf',
      });

      const req = new NextRequest('http://localhost:3000/api/storage/presign-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'evidence photo 1.jpg',
          contentType: 'image/jpeg',
          context: 'claims',
        }),
      });

      const res = await handlePresignUpload(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.uploadUrl).toBe('https://r2.mock/upload?signed=true');
      expect(data.key).toContain('claims/');
      expect(data.key).toContain('evidence_photo_1.jpg');
    });

    it('returns 400 Bad Request when mandatory fields are missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/storage/presign-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: '',
        }),
      });

      const res = await handlePresignUpload(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Invalid upload request');
    });

    it('returns 500 when R2 client throws an error', async () => {
      vi.mocked(r2.createPresignedUploadUrl).mockRejectedValueOnce(new Error('S3 error'));

      const req = new NextRequest('http://localhost:3000/api/storage/presign-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'doc.pdf',
          contentType: 'application/pdf',
        }),
      });

      const res = await handlePresignUpload(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('Internal Server Error generating upload URL');
    });
  });

  describe('POST /api/storage/presign-download', () => {
    it('generates presigned download URL on valid key', async () => {
      vi.mocked(r2.createPresignedDownloadUrl).mockResolvedValueOnce(
        'https://r2.mock/download?signed=true'
      );

      const req = new NextRequest('http://localhost:3000/api/storage/presign-download', {
        method: 'POST',
        body: JSON.stringify({
          key: 'shipments/SHP-1001/bill_of_lading.pdf',
        }),
      });

      const res = await handlePresignDownload(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.downloadUrl).toBe('https://r2.mock/download?signed=true');
    });

    it('returns 400 Bad Request when key is missing or empty', async () => {
      const req = new NextRequest('http://localhost:3000/api/storage/presign-download', {
        method: 'POST',
        body: JSON.stringify({
          key: '',
        }),
      });

      const res = await handlePresignDownload(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Invalid download request');
    });

    it('returns 500 when presign download fails', async () => {
      vi.mocked(r2.createPresignedDownloadUrl).mockRejectedValueOnce(new Error('S3 error'));

      const req = new NextRequest('http://localhost:3000/api/storage/presign-download', {
        method: 'POST',
        body: JSON.stringify({
          key: 'shipments/doc.pdf',
        }),
      });

      const res = await handlePresignDownload(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('Internal Server Error generating download URL');
    });
  });
});
