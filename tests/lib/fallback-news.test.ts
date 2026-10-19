import { describe, it, expect } from 'vitest';
import { FALLBACK_NEWS_ARTICLES } from '@/lib/fallback-news';

describe('src/lib/fallback-news.ts - Static Export News Fallbacks', () => {
  it('contains valid mock news articles with required fields', () => {
    expect(FALLBACK_NEWS_ARTICLES.length).toBeGreaterThan(0);
    FALLBACK_NEWS_ARTICLES.forEach((article) => {
      expect(article.id).toBeDefined();
      expect(article.title).toBeTruthy();
      expect(article.slug).toBeTruthy();
      expect(article.summary).toBeTruthy();
      expect(article.contentHtml).toBeTruthy();
      expect(typeof article.isSlider).toBe('boolean');
      expect(new Date(article.publishedAt).getTime()).not.toBeNaN();
    });
  });

  it('includes articles marked for hero slider', () => {
    const sliderArticles = FALLBACK_NEWS_ARTICLES.filter((a) => a.isSlider);
    expect(sliderArticles.length).toBeGreaterThan(0);
  });
});
