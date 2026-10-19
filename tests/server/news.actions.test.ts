import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import * as newsActions from '@/server/actions/news.actions';
import {
  getHeroSliderArticles,
  getLatestNewsArticles,
  getNewsArticleBySlug,
  getAllNewsArticles,
  getRelatedNewsArticles,
} from '@/server/actions/news.actions';
import { formatNewsDate, calculateReadTime } from '@/lib/utils';


vi.mock('@/lib/prisma', () => ({
  prisma: {
    newsArticle: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('news.actions', () => {
  const mockArticles = [
    {
      id: 'art-1',
      title: 'Global Meat Market Update',
      slug: 'global-meat-market-update',
      summary: 'Analysis of market trends',
      contentHtml: '<p>Full content for global meat market</p>',
      imageUrl: 'news/img1.webp',
      isSlider: true,
      publishedAt: new Date('2026-10-15T10:00:00.000Z'),
    },
    {
      id: 'art-2',
      title: 'SFDA Compliance Audit Completed',
      slug: 'sfda-compliance-audit',
      summary: '100% compliance score achieved',
      contentHtml: '<p>Audit results</p>',
      imageUrl: null,
      isSlider: false,
      publishedAt: new Date('2026-10-12T08:30:00.000Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatNewsDate helper', () => {
    it('returns empty string for null, undefined, or empty input', () => {
      expect(formatNewsDate(null)).toBe('');
      expect(formatNewsDate(undefined)).toBe('');
      expect(formatNewsDate('')).toBe('');
    });

    it('returns empty string for invalid date string', () => {
      expect(formatNewsDate('invalid-date')).toBe('');
    });

    it('formats ISO string correctly into DD.MM.YYYY', () => {
      const date = new Date(2026, 9, 15); // 15 Oct 2026
      expect(formatNewsDate(date.toISOString())).toBe('15.10.2026');
    });

    it('formats Date object correctly into DD.MM.YYYY', () => {
      const date = new Date(2026, 0, 8); // 08 Jan 2026
      expect(formatNewsDate(date)).toBe('08.01.2026');
    });
  });

  describe('calculateReadTime helper', () => {
    it('returns 1 min read for null, undefined, or empty html', () => {
      expect(calculateReadTime(null)).toBe('1 min read');
      expect(calculateReadTime(undefined)).toBe('1 min read');
      expect(calculateReadTime('')).toBe('1 min read');
    });

    it('calculates read time based on word count', () => {
      const shortText = '<p>Short paragraph with twenty words.</p>';
      expect(calculateReadTime(shortText)).toBe('1 min read');

      // 400 words
      const manyWords = Array(400).fill('word').join(' ');
      expect(calculateReadTime(`<p>${manyWords}</p>`)).toBe('3 min read');
    });
  });

  describe('getHeroSliderArticles', () => {
    it('returns formatted slider articles on success', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce([mockArticles[0]] as any);

      const res = await getHeroSliderArticles();

      expect(res.success).toBe(true);
      expect(res.articles).toHaveLength(1);
      expect(res.articles[0].id).toBe('art-1');
      expect(res.articles[0].slug).toBe('global-meat-market-update');
      expect(res.articles[0].publishedAt).toBe('2026-10-15T10:00:00.000Z');
      expect(prisma.newsArticle.findMany).toHaveBeenCalledWith({
        where: { isSlider: true },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      });
    });

    it('returns error when findMany throws', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockRejectedValueOnce(new Error('DB Connection Timeout'));

      const res = await getHeroSliderArticles();

      expect(res.success).toBe(false);
      expect(res.articles).toHaveLength(0);
      expect(res.error).toBe('DB Connection Timeout');
    });

    it('handles non-Error thrown gracefully', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockRejectedValueOnce('string error');

      const res = await getHeroSliderArticles();

      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch slider announcements');
    });
  });

  describe('getLatestNewsArticles', () => {
    it('returns latest articles with default limit', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce(mockArticles as any);

      const res = await getLatestNewsArticles();

      expect(res.success).toBe(true);
      expect(res.articles).toHaveLength(2);
      expect(prisma.newsArticle.findMany).toHaveBeenCalledWith({
        orderBy: { publishedAt: 'desc' },
        take: 4,
      });
    });

    it('returns latest articles with custom limit', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce([mockArticles[0]] as any);

      const res = await getLatestNewsArticles(1);

      expect(res.success).toBe(true);
      expect(prisma.newsArticle.findMany).toHaveBeenCalledWith({
        orderBy: { publishedAt: 'desc' },
        take: 1,
      });
    });

    it('returns error when query fails', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockRejectedValueOnce(new Error('Prisma error'));

      const res = await getLatestNewsArticles();

      expect(res.success).toBe(false);
      expect(res.error).toBe('Prisma error');
    });

    it('handles non-Error thrown in getLatestNewsArticles', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockRejectedValueOnce('raw string error');

      const res = await getLatestNewsArticles();

      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch latest news');
    });
  });

  describe('getNewsArticleBySlug', () => {
    it('returns error if slug is missing or empty', async () => {
      const res = await getNewsArticleBySlug('');

      expect(res.success).toBe(false);
      expect(res.article).toBeNull();
      expect(res.error).toBe('Slug is required');
      expect(prisma.newsArticle.findUnique).not.toHaveBeenCalled();
    });

    it('returns article when found by slug', async () => {
      vi.mocked(prisma.newsArticle.findUnique).mockResolvedValueOnce(mockArticles[0] as any);

      const res = await getNewsArticleBySlug('global-meat-market-update');

      expect(res.success).toBe(true);
      expect(res.article?.title).toBe('Global Meat Market Update');
      expect(res.article?.publishedAt).toBe('2026-10-15T10:00:00.000Z');
      expect(prisma.newsArticle.findUnique).toHaveBeenCalledWith({
        where: { slug: 'global-meat-market-update' },
      });
    });

    it('returns error when article is not found in database', async () => {
      vi.mocked(prisma.newsArticle.findUnique).mockResolvedValueOnce(null);

      const res = await getNewsArticleBySlug('non-existent-article');

      expect(res.success).toBe(false);
      expect(res.article).toBeNull();
      expect(res.error).toBe('Article not found');
    });

    it('returns error when findUnique throws Error', async () => {
      vi.mocked(prisma.newsArticle.findUnique).mockRejectedValueOnce(new Error('DB read failure'));

      const res = await getNewsArticleBySlug('err-slug');

      expect(res.success).toBe(false);
      expect(res.article).toBeNull();
      expect(res.error).toBe('DB read failure');
    });

    it('handles non-Error thrown in getNewsArticleBySlug', async () => {
      vi.mocked(prisma.newsArticle.findUnique).mockRejectedValueOnce(12345);

      const res = await getNewsArticleBySlug('err-slug-2');

      expect(res.success).toBe(false);
      expect(res.article).toBeNull();
      expect(res.error).toBe('Failed to fetch article');
    });
  });

  describe('getAllNewsArticles', () => {
    it('returns all articles sorted by publishedAt desc', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce(mockArticles as any);

      const res = await getAllNewsArticles();

      expect(res.success).toBe(true);
      expect(res.articles).toHaveLength(2);
      expect(prisma.newsArticle.findMany).toHaveBeenCalledWith({
        orderBy: { publishedAt: 'desc' },
      });
    });

    it('returns error when findMany throws Error', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockRejectedValueOnce(new Error('DB connection closed'));

      const res = await getAllNewsArticles();

      expect(res.success).toBe(false);
      expect(res.articles).toHaveLength(0);
      expect(res.error).toBe('DB connection closed');
    });

    it('handles non-Error thrown in getAllNewsArticles', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockRejectedValueOnce('raw error string');

      const res = await getAllNewsArticles();

      expect(res.success).toBe(false);
      expect(res.articles).toHaveLength(0);
      expect(res.error).toBe('Failed to fetch all news');
    });
  });

  describe('getRelatedNewsArticles', () => {
    it('returns related articles excluding current slug with custom limit', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce([mockArticles[1]] as any);

      const res = await getRelatedNewsArticles('global-meat-market-update', 2);

      expect(res.success).toBe(true);
      expect(res.articles).toHaveLength(1);
      expect(prisma.newsArticle.findMany).toHaveBeenCalledWith({
        where: { slug: { not: 'global-meat-market-update' } },
        orderBy: { publishedAt: 'desc' },
        take: 2,
      });
    });

    it('returns error when query throws Error', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockRejectedValueOnce(new Error('Query failed'));

      const res = await getRelatedNewsArticles('slug-1');

      expect(res.success).toBe(false);
      expect(res.error).toBe('Query failed');
    });

    it('handles non-Error thrown in getRelatedNewsArticles', async () => {
      vi.mocked(prisma.newsArticle.findMany).mockRejectedValueOnce('string error');

      const res = await getRelatedNewsArticles('slug-1');

      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch related news');
    });
  });

  describe('getArticleWithFallback', () => {
    it('returns article from DB and related articles when found', async () => {
      vi.mocked(prisma.newsArticle.findUnique).mockResolvedValueOnce(mockArticles[0] as any);
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce([mockArticles[1]] as any);

      const res = await newsActions.getArticleWithFallback('global-meat-market-update');

      expect(res.article?.id).toBe('art-1');
      expect(res.relatedArticles).toHaveLength(1);
    });

    it('falls back to default related articles when related query returns empty', async () => {
      vi.mocked(prisma.newsArticle.findUnique).mockResolvedValueOnce(mockArticles[0] as any);
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce([]);

      const res = await newsActions.getArticleWithFallback('global-meat-market-update');

      expect(res.article?.id).toBe('art-1');
      expect(res.relatedArticles.length).toBeGreaterThan(0);
    });

    it('returns fallback article when DB returns null but slug exists in fallback list', async () => {
      vi.mocked(prisma.newsArticle.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce([]);

      const res = await newsActions.getArticleWithFallback('halal-assurance-sfda-compliance-audit-2026');

      expect(res.article?.slug).toBe('halal-assurance-sfda-compliance-audit-2026');
      expect(res.relatedArticles.length).toBeGreaterThan(0);
    });

    it('returns null article and empty relatedArticles when slug is unknown', async () => {
      vi.mocked(prisma.newsArticle.findUnique).mockResolvedValueOnce(null);

      const res = await newsActions.getArticleWithFallback('unknown-article-slug');

      expect(res.article).toBeNull();
      expect(res.relatedArticles).toHaveLength(0);
    });
  });
});
