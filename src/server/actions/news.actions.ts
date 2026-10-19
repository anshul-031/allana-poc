'use server';

import { prisma } from '@/lib/prisma';

export interface NewsArticleDTO {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  imageUrl: string | null;
  isSlider: boolean;
  publishedAt: string; // ISO string
}

export interface GetNewsResult {
  success: boolean;
  articles: NewsArticleDTO[];
  error?: string;
}

/**
 * Fetch hero slider announcements
 */
export async function getHeroSliderArticles(): Promise<GetNewsResult> {
  try {
    const records = await prisma.newsArticle.findMany({
      where: { isSlider: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    const articles: NewsArticleDTO[] = records.map((a: (typeof records)[number]) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      contentHtml: a.contentHtml,
      imageUrl: a.imageUrl,
      isSlider: a.isSlider,
      publishedAt: a.publishedAt.toISOString(),
    }));

    return {
      success: true,
      articles,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch slider announcements';
    return {
      success: false,
      articles: [],
      error: message,
    };
  }
}

/**
 * Fetch latest news articles for the 4-card dashboard grid
 */
export async function getLatestNewsArticles(limit = 4): Promise<GetNewsResult> {
  try {
    const records = await prisma.newsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    const articles: NewsArticleDTO[] = records.map((a: (typeof records)[number]) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      contentHtml: a.contentHtml,
      imageUrl: a.imageUrl,
      isSlider: a.isSlider,
      publishedAt: a.publishedAt.toISOString(),
    }));

    return {
      success: true,
      articles,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch latest news';
    return {
      success: false,
      articles: [],
      error: message,
    };
  }
}

/**
 * Fetch a single news article by slug
 */
export async function getNewsArticleBySlug(slug: string): Promise<{
  success: boolean;
  article: NewsArticleDTO | null;
  error?: string;
}> {
  if (!slug) {
    return { success: false, article: null, error: 'Slug is required' };
  }

  try {
    const record = await prisma.newsArticle.findUnique({
      where: { slug },
    });

    if (!record) {
      return { success: false, article: null, error: 'Article not found' };
    }

    return {
      success: true,
      article: {
        id: record.id,
        title: record.title,
        slug: record.slug,
        summary: record.summary,
        contentHtml: record.contentHtml,
        imageUrl: record.imageUrl,
        isSlider: record.isSlider,
        publishedAt: record.publishedAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch article';
    return {
      success: false,
      article: null,
      error: message,
    };
  }
}

/**
 * Format publication date into DD.MM.YYYY
 */
export function formatNewsDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Calculate estimated read time in minutes
 */
export function calculateReadTime(contentHtml?: string | null): string {
  if (!contentHtml) return '1 min read';
  const cleanText = contentHtml.replace(/<[^>]*>/g, ' ').trim();
  const words = cleanText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

/**
 * Fetch all published news articles
 */
export async function getAllNewsArticles(): Promise<GetNewsResult> {
  try {
    const records = await prisma.newsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    const articles: NewsArticleDTO[] = records.map((a: (typeof records)[number]) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      contentHtml: a.contentHtml,
      imageUrl: a.imageUrl,
      isSlider: a.isSlider,
      publishedAt: a.publishedAt.toISOString(),
    }));

    return {
      success: true,
      articles,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch all news';
    return {
      success: false,
      articles: [],
      error: message,
    };
  }
}

/**
 * Fetch related news articles excluding current article slug
 */
export async function getRelatedNewsArticles(
  currentSlug: string,
  limit = 3
): Promise<GetNewsResult> {
  try {
    const records = await prisma.newsArticle.findMany({
      where: {
        slug: { not: currentSlug },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    const articles: NewsArticleDTO[] = records.map((a: (typeof records)[number]) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      contentHtml: a.contentHtml,
      imageUrl: a.imageUrl,
      isSlider: a.isSlider,
      publishedAt: a.publishedAt.toISOString(),
    }));

    return {
      success: true,
      articles,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch related news';
    return {
      success: false,
      articles: [],
      error: message,
    };
  }
}

export const FALLBACK_NEWS_ARTICLES: NewsArticleDTO[] = [
  {
    id: 'news-fallback-1',
    title: 'Global Meat Market Update: Q4 Buffalo Export Trends & Ocean Freight Forecast',
    slug: 'global-meat-market-update-q4-2026',
    summary:
      'Analysis of cattle livestock cycles, port congestion at Nhava Sheva, and freight rate stabilization heading into festive demand across the Middle East.',
    contentHtml: '<p>Ocean freight rates on West Coast India to Arabian Gulf lanes stabilized...</p>',
    imageUrl: 'news/market-update-q4.webp',
    isSlider: false,
    publishedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'news-fallback-2',
    title: 'Halal Assurance & SFDA Compliance Audit Completed Successfully',
    slug: 'halal-assurance-sfda-compliance-audit-2026',
    summary:
      'Allana export slaughterhouses in Aligarh and Sahibabad achieved 100% compliance score in the annual reassessment by Jamiat Ulama-i-Hind Halal Trust.',
    contentHtml: '<p>Allana export slaughterhouses in Aligarh and Sahibabad achieved 100% compliance...</p>',
    imageUrl: 'news/halal-audit-certified.webp',
    isSlider: false,
    publishedAt: '2026-10-12T08:30:00.000Z',
  },
  {
    id: 'news-fallback-3',
    title: 'Allana Expands Ultra-Low Temperature Cold Chain Fleet for GCC Trade',
    slug: 'allana-expands-cold-chain-fleet-gcc',
    summary:
      'Commissioning 50 new smart reefer containers equipped with real-time IoT temperature and GPS telemetry to guarantee unbroken cold chain visibility.',
    contentHtml: '<p>Allanasons Private Limited has inducted 50 state-of-the-art reefer containers...</p>',
    imageUrl: 'news/smart-reefer-fleet.webp',
    isSlider: true,
    publishedAt: '2026-10-08T12:00:00.000Z',
  },
  {
    id: 'news-fallback-4',
    title: 'New Value-Added Chilled Goat Cubes Launch in LuLu UAE Outlets',
    slug: 'chilled-goat-cubes-lulu-uae',
    summary:
      'Retail skin-pack MAP trays launched across 40 hypermarket locations with 60-day shelf stability developed collaboratively through our NPD pipeline.',
    contentHtml: '<p>Developed through our collaborative Customized Product NPD pipeline...</p>',
    imageUrl: 'news/goat-tray-retail.webp',
    isSlider: true,
    publishedAt: '2026-10-02T09:00:00.000Z',
  },
];

/**
 * Encapsulate article lookup with fallback and related articles resolution
 */
export async function getArticleWithFallback(slug: string): Promise<{
  article: NewsArticleDTO | null;
  relatedArticles: NewsArticleDTO[];
}> {
  const res = await getNewsArticleBySlug(slug);
  const article =
    res.article || FALLBACK_NEWS_ARTICLES.find((a) => a.slug === slug) || null;

  if (!article) {
    return { article: null, relatedArticles: [] };
  }

  const relRes = await getRelatedNewsArticles(slug, 3);
  const relatedArticles =
    relRes.success && relRes.articles.length > 0
      ? relRes.articles
      : FALLBACK_NEWS_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return { article, relatedArticles };
}
