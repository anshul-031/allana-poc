import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import NotificationDrawer, { formatRelativeTime } from '@/components/notifications/NotificationDrawer';
import NewsCard, { getArticleCategory } from '@/components/news/NewsCard';
import NewsListingView from '@/components/news/NewsListingView';
import ArticleDetailView from '@/components/news/ArticleDetailView';
import NewsPage from '@/app/(portal)/news/page';
import NewsArticlePage, { generateMetadata } from '@/app/(portal)/news/[slug]/page';
import * as notificationActions from '@/server/actions/notification.actions';
import * as newsActions from '@/server/actions/news.actions';

vi.mock('@/server/actions/notification.actions', async () => {
  const actual = await vi.importActual<typeof notificationActions>(
    '@/server/actions/notification.actions'
  );
  return {
    ...actual,
    getUserNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
    setNotificationReadStatus: vi.fn(),
  };
});

vi.mock('@/server/actions/news.actions', async () => {
  const actual = await vi.importActual<typeof newsActions>('@/server/actions/news.actions');
  return {
    ...actual,
    getAllNewsArticles: vi.fn(),
    getLatestNewsArticles: vi.fn(),
    getNewsArticleBySlug: vi.fn(),
    getRelatedNewsArticles: vi.fn(),
    getArticleWithFallback: vi.fn(),
  };
});

const mockNotifications: notificationActions.NotificationDTO[] = [
  {
    id: 'notif-1',
    userId: 'u-1',
    title: 'Custom Product Update: NPD-2026-014',
    message: 'Your request for 450g Goat Cubes moved to Analysis stage.',
    link: '/customized-products',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'u-1',
    title: 'Shipment Arrival Notice: ORD-2026-88045',
    message: 'Vessel berthed at Dammam Port.',
    link: '/shipments',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'u-1',
    title: 'SFDA Permit Renewal',
    message: 'Certificate uploaded.',
    link: null,
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const mockArticles: newsActions.NewsArticleDTO[] = [
  {
    id: 'art-1',
    title: 'SFDA Compliance Audit Completed Successfully',
    slug: 'sfda-compliance-audit-2026',
    summary: 'Allana export slaughterhouses achieved 100% compliance score.',
    contentHtml: '<p>Comprehensive veterinary and hygiene protocols were validated.</p>',
    imageUrl: 'news/sfda-audit.webp',
    isSlider: true,
    publishedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'art-2',
    title: 'Global Meat Market Trends & Freight Forecast',
    slug: 'global-meat-market-trends',
    summary: 'Ocean freight index stabilized across West Coast India to GCC lanes.',
    contentHtml: '<p>Containerized reefer spot rates showed steady equilibrium.</p>',
    imageUrl: null,
    isSlider: false,
    publishedAt: '2026-10-10T08:00:00.000Z',
  },
  {
    id: 'art-3',
    title: 'New Value-Added Chilled Goat Cubes Launch',
    slug: 'chilled-goat-cubes-launch',
    summary: 'Collaborative NPD retail skin-pack tray launched in LuLu hypermarkets.',
    contentHtml: '<p>Skin packaging preserves freshness for up to 60 days.</p>',
    imageUrl: null,
    isSlider: false,
    publishedAt: '2026-10-05T08:00:00.000Z',
  },
];

describe('Module 9: Notifications & News Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // FEAT-9.1: NotificationDrawer Component Tests
  // ==========================================
  describe('NotificationDrawer (FEAT-9.1)', () => {
    it('formats relative times correctly', () => {
      const now = Date.now();
      expect(formatRelativeTime(new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString())).toBe('3d ago');
      expect(formatRelativeTime(new Date(now - 4 * 60 * 60 * 1000).toISOString())).toBe('4h ago');
      expect(formatRelativeTime(new Date(now - 15 * 60 * 1000).toISOString())).toBe('15m ago');
      expect(formatRelativeTime(new Date(now - 5 * 1000).toISOString())).toBe('Just now');
    });

    it('renders bell button and badge', () => {
      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
          initialUnreadCount={2}
        />
      );

      expect(screen.getByRole('button', { name: /Notifications \(2 unread\)/i })).toBeInTheDocument();
      expect(screen.getByTestId('notification-unread-badge')).toHaveTextContent('2');
    });

    it('renders 99+ when unreadCount exceeds 99', () => {
      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
          initialUnreadCount={150}
        />
      );
      expect(screen.getByTestId('notification-unread-badge')).toHaveTextContent('99+');
    });

    it('opens drawer on click and renders header, items, and controls', () => {
      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));

      expect(screen.getByTestId('notification-popover')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('2 new')).toBeInTheDocument();
      expect(screen.getByText('Show only unread')).toBeInTheDocument();
      expect(screen.getByTestId('mark-all-read-btn')).toBeInTheDocument();
      expect(screen.getByTestId('check-all-notifications')).toBeInTheDocument();

      expect(screen.getByText('Custom Product Update: NPD-2026-014')).toBeInTheDocument();
      expect(screen.getByText('Shipment Arrival Notice: ORD-2026-88045')).toBeInTheDocument();
      expect(screen.getByText('SFDA Permit Renewal')).toBeInTheDocument();
    });

    it('toggles show only unread filter', () => {
      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      const toggle = screen.getByTestId('show-unread-toggle');

      // Default: all 3 are visible
      expect(screen.getByText('SFDA Permit Renewal')).toBeInTheDocument();

      // Check toggle
      fireEvent.click(toggle);

      // Now only 2 unread should be shown
      expect(screen.queryByText('SFDA Permit Renewal')).not.toBeInTheDocument();
      expect(screen.getByText('Custom Product Update: NPD-2026-014')).toBeInTheDocument();
    });

    it('displays empty message when show only unread is active and no unread exists', () => {
      const allReadNotifications = mockNotifications.map((n) => ({ ...n, isRead: true }));
      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={allReadNotifications}
          initialUnreadCount={0}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      fireEvent.click(screen.getByTestId('show-unread-toggle'));

      expect(screen.getByText('No unread notifications')).toBeInTheDocument();
    });

    it('toggles individual checkbox read status', async () => {
      vi.mocked(notificationActions.setNotificationReadStatus).mockResolvedValue({ success: true });

      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      const checkbox1 = screen.getByTestId('notification-checkbox-notif-1');

      // Initially false, click to mark as read
      fireEvent.click(checkbox1);

      await waitFor(() => {
        expect(notificationActions.setNotificationReadStatus).toHaveBeenCalledWith('notif-1', true);
      });
    });

    it('marks notification as read on item click and closes drawer', async () => {
      vi.mocked(notificationActions.markNotificationAsRead).mockResolvedValue({ success: true });

      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      const itemTitle = screen.getByText('Custom Product Update: NPD-2026-014');
      fireEvent.click(itemTitle);

      await waitFor(() => {
        expect(notificationActions.markNotificationAsRead).toHaveBeenCalledWith('notif-1');
        expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();
      });
    });

    it('handles keydown Enter on notification item', async () => {
      vi.mocked(notificationActions.markNotificationAsRead).mockResolvedValue({ success: true });

      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      const item = screen.getByTestId('notification-item-notif-3');
      fireEvent.keyDown(item, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();
      });
    });

    it('handles keydown Space on notification item', async () => {
      vi.mocked(notificationActions.markNotificationAsRead).mockResolvedValue({ success: true });

      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      const item = screen.getByTestId('notification-item-notif-3');
      fireEvent.keyDown(item, { key: ' ' });

      await waitFor(() => {
        expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();
      });
    });

    it('marks all notifications as read via top mark all read button', async () => {
      vi.mocked(notificationActions.markAllNotificationsAsRead).mockResolvedValue({ success: true });

      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      const markAllBtn = screen.getByTestId('mark-all-read-btn');
      fireEvent.click(markAllBtn);

      await waitFor(() => {
        expect(notificationActions.markAllNotificationsAsRead).toHaveBeenCalledWith('u-1');
      });
    });

    it('marks all notifications as read via bottom check all master checkbox', async () => {
      vi.mocked(notificationActions.markAllNotificationsAsRead).mockResolvedValue({ success: true });

      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      const checkAllCheckbox = screen.getByTestId('check-all-notifications');
      fireEvent.click(checkAllCheckbox);

      await waitFor(() => {
        expect(notificationActions.markAllNotificationsAsRead).toHaveBeenCalledWith('u-1');
      });
    });

    it('supports controlled isOpen and onClose props', () => {
      const handleClose = vi.fn();
      render(
        <NotificationDrawer
          userId="u-1"
          initialNotifications={mockNotifications}
          isOpen={true}
          onClose={handleClose}
        />
      );

      expect(screen.getByTestId('notification-popover')).toBeInTheDocument();

      // Click bell button triggers controlled onClose
      fireEvent.click(screen.getByTestId('notification-bell-button'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on outside click and on Escape key', () => {
      render(
        <div>
          <div data-testid="outside">Outside Area</div>
          <NotificationDrawer
            userId="u-1"
            initialNotifications={mockNotifications}
          />
        </div>
      );

      fireEvent.click(screen.getByTestId('notification-bell-button'));
      expect(screen.getByTestId('notification-popover')).toBeInTheDocument();

      // Outside click
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();

      // Re-open and test Escape
      fireEvent.click(screen.getByTestId('notification-bell-button'));
      expect(screen.getByTestId('notification-popover')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();
    });

    it('fetches notifications on mount when initialNotifications is missing', async () => {
      vi.mocked(notificationActions.getUserNotifications).mockResolvedValue({
        success: true,
        notifications: mockNotifications,
        unreadCount: 2,
      });

      render(<NotificationDrawer userId="u-1" />);

      await waitFor(() => {
        expect(notificationActions.getUserNotifications).toHaveBeenCalledWith('u-1');
      });
    });
  });

  // ==========================================
  // FEAT-9.2: NewsCard & Category Helper Tests
  // ==========================================
  describe('NewsCard & Category Helpers (FEAT-9.2)', () => {
    it('classifies article categories accurately', () => {
      expect(getArticleCategory('SFDA Audit Protocols', 'Compliance checklist')).toBe('SFDA & Compliance');
      expect(getArticleCategory('Ocean Freight Rate Update', 'Global market trends')).toBe('Market Trends');
      expect(getArticleCategory('New Product Launch: IQF Striploin', 'NPD custom cut')).toBe('Product Launches');
      expect(getArticleCategory('General Announcement', 'Warehouse operational schedule')).toBe('Export Insights');
    });

    it('renders news card in standard and featured layout', () => {
      const { rerender } = render(<NewsCard article={mockArticles[0]} featured={false} />);

      expect(screen.getByTestId(`news-card-${mockArticles[0].id}`)).toBeInTheDocument();
      expect(screen.getByText('SFDA & Compliance')).toBeInTheDocument();
      expect(screen.getByText('SFDA Compliance Audit Completed Successfully')).toBeInTheDocument();
      expect(screen.getByText('Allana export slaughterhouses achieved 100% compliance score.')).toBeInTheDocument();
      expect(screen.getByText('15.10.2026')).toBeInTheDocument();

      // Rerender with featured=true
      rerender(<NewsCard article={mockArticles[0]} featured={true} />);
      expect(screen.getByTestId(`news-card-${mockArticles[0].id}`)).toBeInTheDocument();
    });
  });

  // ==========================================
  // FEAT-9.2: NewsListingView Component Tests
  // ==========================================
  describe('NewsListingView (FEAT-9.2)', () => {
    it('renders heading, search input, categories, and article cards', () => {
      render(<NewsListingView initialArticles={mockArticles} />);

      expect(screen.getByText('News & Market Updates')).toBeInTheDocument();
      expect(screen.getByTestId('news-search-input')).toBeInTheDocument();
      expect(screen.getByTestId('found-articles-count')).toHaveTextContent('Found 3 articles');
      expect(screen.getByTestId('news-listing-grid')).toBeInTheDocument();
    });

    it('filters articles by search query and supports clear button', () => {
      render(<NewsListingView initialArticles={mockArticles} />);

      const searchInput = screen.getByTestId('news-search-input');
      fireEvent.change(searchInput, { target: { value: 'freight' } });

      expect(screen.getByText('Global Meat Market Trends & Freight Forecast')).toBeInTheDocument();
      expect(screen.queryByText('SFDA Compliance Audit Completed Successfully')).not.toBeInTheDocument();
      expect(screen.getByTestId('found-articles-count')).toHaveTextContent('Found 1 article');

      // Clear search
      const clearBtn = screen.getByTestId('clear-search-button');
      fireEvent.click(clearBtn);

      expect(screen.getByText('SFDA Compliance Audit Completed Successfully')).toBeInTheDocument();
      expect(screen.getByTestId('found-articles-count')).toHaveTextContent('Found 3 articles');
    });

    it('filters articles by category pills', () => {
      render(<NewsListingView initialArticles={mockArticles} />);

      const sfdaTab = screen.getByTestId('category-filter-sfda-&-compliance');
      fireEvent.click(sfdaTab);

      expect(screen.getByText('SFDA Compliance Audit Completed Successfully')).toBeInTheDocument();
      expect(screen.queryByText('Global Meat Market Trends & Freight Forecast')).not.toBeInTheDocument();

      const allTab = screen.getByTestId('category-filter-all-articles');
      fireEvent.click(allTab);
      expect(screen.getByText('Global Meat Market Trends & Freight Forecast')).toBeInTheDocument();
    });

    it('sorts articles ascending and descending by date', () => {
      render(<NewsListingView initialArticles={mockArticles} />);

      const sortSelect = screen.getByTestId('news-sort-select');
      fireEvent.change(sortSelect, { target: { value: 'asc' } });

      // After sorting ascending, oldest is first
      expect(sortSelect).toHaveValue('asc');
    });

    it('renders empty state when search returns no match, and resets all filters', () => {
      render(<NewsListingView initialArticles={mockArticles} />);

      const searchInput = screen.getByTestId('news-search-input');
      fireEvent.change(searchInput, { target: { value: 'non-existent-keyword-xyz' } });

      expect(screen.getByTestId('news-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No Articles Found')).toBeInTheDocument();

      const resetBtn = screen.getByTestId('reset-filters-button');
      fireEvent.click(resetBtn);

      expect(screen.getByText('SFDA Compliance Audit Completed Successfully')).toBeInTheDocument();
    });
  });

  // ==========================================
  // FEAT-9.2: ArticleDetailView Component Tests
  // ==========================================
  describe('ArticleDetailView (FEAT-9.2)', () => {
    it('renders 404 state when article is null', () => {
      render(<ArticleDetailView article={null} />);

      expect(screen.getByTestId('article-not-found')).toBeInTheDocument();
      expect(screen.getByText('Article Not Found')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to All News/i })).toBeInTheDocument();
    });

    it('renders article header, content, takeaways, and related articles', () => {
      render(
        <ArticleDetailView
          article={mockArticles[0]}
          relatedArticles={[mockArticles[1]]}
        />
      );

      expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: 'SFDA Compliance Audit Completed Successfully',
          level: 1,
        })
      ).toBeInTheDocument();
      expect(screen.getByTestId('article-content-body')).toBeInTheDocument();
      expect(screen.getByText('Key Partner Highlights & Next Steps')).toBeInTheDocument();
      expect(screen.getByTestId('related-articles-section')).toBeInTheDocument();
      expect(screen.getByText('Related Market Updates')).toBeInTheDocument();
    });

    it('handles print button click', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      render(<ArticleDetailView article={mockArticles[0]} />);

      fireEvent.click(screen.getByTestId('print-article-btn'));
      expect(printSpy).toHaveBeenCalledTimes(1);

      printSpy.mockRestore();
    });

    it('handles share button click and copies URL to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<ArticleDetailView article={mockArticles[0]} />);

      const shareBtn = screen.getByTestId('share-article-btn');
      fireEvent.click(shareBtn);

      expect(writeTextMock).toHaveBeenCalled();
      expect(screen.getByText('✓ Copied Link')).toBeInTheDocument();
    });
  });

  // ==========================================
  // FEAT-9.2: App Router Pages Tests
  // ==========================================
  describe('News App Router Pages (FEAT-9.2)', () => {
    it('renders /news page with fetched articles', async () => {
      vi.mocked(newsActions.getAllNewsArticles).mockResolvedValue({
        success: true,
        articles: mockArticles,
      });

      const page = await NewsPage();
      render(page);

      expect(screen.getByText('News & Market Updates')).toBeInTheDocument();
      expect(screen.getByText('SFDA Compliance Audit Completed Successfully')).toBeInTheDocument();
    });

    it('renders /news page with fallback articles when database returns empty', async () => {
      vi.mocked(newsActions.getAllNewsArticles).mockResolvedValue({
        success: false,
        articles: [],
      });

      const page = await NewsPage();
      render(page);

      expect(screen.getByText('News & Market Updates')).toBeInTheDocument();
    });

    it('renders /news/[slug] page for existing article with related articles', async () => {
      vi.mocked(newsActions.getArticleWithFallback).mockResolvedValueOnce({
        article: mockArticles[0],
        relatedArticles: [mockArticles[1]],
      });

      const page = await NewsArticlePage({
        params: Promise.resolve({ slug: 'sfda-compliance-audit-2026' }),
      });
      render(page);

      expect(
        screen.getByRole('heading', {
          name: 'SFDA Compliance Audit Completed Successfully',
          level: 1,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('Related Market Updates')).toBeInTheDocument();
    });

    it('generates metadata correctly for existing and missing article', async () => {
      vi.mocked(newsActions.getArticleWithFallback).mockResolvedValueOnce({
        article: mockArticles[0],
        relatedArticles: [],
      });

      const meta1 = await generateMetadata({
        params: Promise.resolve({ slug: 'sfda-compliance-audit-2026' }),
      });
      expect(meta1.title).toContain('SFDA Compliance Audit Completed Successfully');

      vi.mocked(newsActions.getArticleWithFallback).mockResolvedValueOnce({
        article: null,
        relatedArticles: [],
      });

      const meta2 = await generateMetadata({
        params: Promise.resolve({ slug: 'unknown-slug-xyz' }),
      });
      expect(meta2.title).toContain('Article Not Found');
    });
  });
});
