import React from 'react';
import { Metadata } from 'next';
import NewsListingView from '@/components/news/NewsListingView';
import { getAllNewsArticles } from '@/server/actions/news.actions';
import { FALLBACK_NEWS_ARTICLES } from '@/lib/fallback-news';


export const metadata: Metadata = {
  title: 'Export News & Market Insights | Allana Customer Portal',
  description:
    'Official veterinary compliance updates, SFDA protocols, and meat export market trends from Allanasons.',
};

export default async function NewsPage() {
  const result = await getAllNewsArticles();
  const articles =
    result.success && result.articles.length > 0
      ? result.articles
      : FALLBACK_NEWS_ARTICLES;

  return <NewsListingView initialArticles={articles} />;
}
