import React from 'react';
import { Metadata } from 'next';
import ArticleDetailView from '@/components/news/ArticleDetailView';
import { getArticleWithFallback } from '@/server/actions/news.actions';

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { article } = await getArticleWithFallback(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Allana Customer Portal',
    };
  }

  return {
    title: `${article.title} | Allana Export News`,
    description: article.summary,
  };
}

export default async function NewsArticlePage({
  params,
}: NewsArticlePageProps) {
  const { slug } = await params;
  const { article, relatedArticles } = await getArticleWithFallback(slug);

  return (
    <ArticleDetailView article={article} relatedArticles={relatedArticles} />
  );
}
