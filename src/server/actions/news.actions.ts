'use server';

import { prisma } from '@/lib/prisma';
import { FALLBACK_NEWS_ARTICLES } from '@/lib/fallback-news';


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
