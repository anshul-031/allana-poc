'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { NewsArticleDTO, getHeroSliderArticles } from '@/server/actions/news.actions';

export interface HeroSliderProps {
  initialSlides?: NewsArticleDTO[];
  autoPlayInterval?: number;
}

export const DEFAULT_FALLBACK_SLIDES: NewsArticleDTO[] = [
  {
    id: 'slide-fallback-1',
    title: 'Allana Expands Ultra-Low Temperature Cold Chain Fleet for GCC Trade',
    slug: 'allana-expands-cold-chain-fleet-gcc',
    summary:
      'Commissioning 50 new smart reefer containers equipped with real-time IoT temperature and GPS telemetry to guarantee unbroken -18°C integrity across Arabian Gulf ports.',
    contentHtml: '<p>Allanasons Private Limited has inducted 50 state-of-the-art reefer containers...</p>',
    imageUrl: 'news/smart-reefer-fleet.webp',
    isSlider: true,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'slide-fallback-2',
    title: 'New Value-Added Chilled Goat Cubes Launch in LuLu UAE Outlets',
    slug: 'chilled-goat-cubes-lulu-uae',
    summary:
      'Retail skin-pack MAP trays launched across 40 hypermarket locations with 60-day shelf stability developed collaboratively through our Customized Product NPD pipeline.',
    contentHtml: '<p>Developed through our collaborative Customized Product NPD pipeline...</p>',
    imageUrl: 'news/goat-tray-retail.webp',
    isSlider: true,
    publishedAt: new Date().toISOString(),
  },
];

export default function HeroSlider({
  initialSlides,
  autoPlayInterval = 6000,
}: HeroSliderProps) {
  const [slides, setSlides] = useState<NewsArticleDTO[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : DEFAULT_FALLBACK_SLIDES
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!initialSlides) {
      getHeroSliderArticles().then((res) => {
        if (res.success && res.articles.length > 0) {
          setSlides(res.articles);
        }
      });
    }
  }, [initialSlides]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, slides.length, autoPlayInterval, goToNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      goToPrev();
    }
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      data-testid="hero-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="Corporate Announcements Slider"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius: 'var(--border-radius-xl)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-primary-dark, #0a192f)',
        color: '#ffffff',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--spacing-xl) var(--spacing-2xl)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: 'var(--spacing-xl)',
        outline: 'none',
        backgroundImage:
          'radial-gradient(circle at 90% 10%, rgba(197, 160, 89, 0.15) 0%, transparent 60%), linear-gradient(135deg, #0a192f 0%, #1e293b 100%)',
        border: '1px solid rgba(197, 160, 89, 0.25)',
      }}
    >
      {/* Top Banner Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          data-testid="slide-category-badge"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-gold, #c5a059)',
            backgroundColor: 'rgba(197, 160, 89, 0.12)',
            border: '1px solid rgba(197, 160, 89, 0.3)',
            padding: '4px 10px',
            borderRadius: 'var(--border-radius-pill)',
          }}
        >
          Strategic Initiative &bull; Allana Agro-Export
        </span>

        {/* Slide Counter */}
        <span
          data-testid="slide-counter"
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          {currentIndex + 1} / {slides.length}
        </span>
      </div>

      {/* Main Slide Content */}
      <div style={{ margin: 'var(--spacing-lg) 0' }}>
        <h2
          data-testid="slide-title"
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 var(--spacing-sm) 0',
            lineHeight: 1.25,
            maxWidth: '850px',
          }}
        >
          {currentSlide.title}
        </h2>

        <p
          data-testid="slide-summary"
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'rgba(255, 255, 255, 0.85)',
            margin: '0 0 var(--spacing-md) 0',
            lineHeight: 1.6,
            maxWidth: '780px',
          }}
        >
          {currentSlide.summary}
        </p>

        <Link
          data-testid="slide-read-more-link"
          href={`/news/${currentSlide.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-gold, #c5a059)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'var(--transition-fast)',
          }}
        >
          <span>Read Full Story</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {/* Slider Controls: Arrows & Dot Indicators */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: 'var(--spacing-md)',
        }}
      >
        {/* Dot Indicators */}
        <div
          role="tablist"
          aria-label="Slide indicators"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              onClick={() => goToSlide(idx)}
              data-testid={`slide-dot-${idx}`}
              style={{
                width: idx === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: 'var(--border-radius-pill)',
                backgroundColor:
                  idx === currentIndex ? 'var(--color-gold, #c5a059)' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            data-testid="slider-prev-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-fast)',
            }}
          >
            &#8249;
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            data-testid="slider-next-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-fast)',
            }}
          >
            &#8250;
          </button>
        </div>
      </div>
    </section>
  );
}
