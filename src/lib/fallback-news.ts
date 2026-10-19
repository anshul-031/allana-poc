import { NewsArticleDTO } from '@/server/actions/news.actions';

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
