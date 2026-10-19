import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import NotificationBell, { formatRelativeTime } from '@/components/common/NotificationBell';
import * as notificationActions from '@/server/actions/notification.actions';

vi.mock('@/server/actions/notification.actions', async () => {
  const actual = await vi.importActual<typeof notificationActions>(
    '@/server/actions/notification.actions'
  );
  return {
    ...actual,
    getUserNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
  };
});

const mockNotifications: notificationActions.NotificationDTO[] = [
  {
    id: 'n-1',
    userId: 'u-1',
    title: 'Custom Product Update: NPD-2026-014',
    message: 'Your request for 450g Goat Cubes moved to Analysis stage.',
    link: '/customized-products',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
  },
  {
    id: 'n-2',
    userId: 'u-1',
    title: 'Shipment Arrival Notice: ORD-2026-88045',
    message: 'Vessel berthed at Dammam Port.',
    link: '/shipments',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
  },
  {
    id: 'n-3',
    userId: 'u-1',
    title: 'General Notification',
    message: 'System maintenance scheduled.',
    link: null, // Test link: null branch
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3d ago
  },
];

describe('NotificationBell Component (FEAT-2.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatRelativeTime helper', () => {
    it('formats days, hours, minutes, and just now accurately', () => {
      const now = Date.now();
      expect(formatRelativeTime(new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString())).toBe('3d ago');
      expect(formatRelativeTime(new Date(now - 5 * 60 * 60 * 1000).toISOString())).toBe('5h ago');
      expect(formatRelativeTime(new Date(now - 12 * 60 * 1000).toISOString())).toBe('12m ago');
      expect(formatRelativeTime(new Date(now - 10 * 1000).toISOString())).toBe('Just now');
    });
  });

  it('renders bell button and unread count badge', () => {
    render(
      <NotificationBell
        userId="u-1"
        initialNotifications={mockNotifications}
        initialUnreadCount={2}
      />
    );

    expect(screen.getByRole('button', { name: /Notifications \(2 unread\)/i })).toBeInTheDocument();
    expect(screen.getByTestId('notification-unread-badge')).toHaveTextContent('2');
  });

  it('displays 99+ when unreadCount exceeds 99', () => {
    render(
      <NotificationBell
        userId="u-1"
        initialNotifications={mockNotifications}
        initialUnreadCount={120}
      />
    );
    expect(screen.getByTestId('notification-unread-badge')).toHaveTextContent('99+');
  });

  it('opens popover when bell button is clicked and lists notifications', () => {
    render(
      <NotificationBell
        userId="u-1"
        initialNotifications={mockNotifications}
      />
    );

    const bellBtn = screen.getByRole('button', { name: /Notifications/i });
    fireEvent.click(bellBtn);

    expect(screen.getByTestId('notification-popover')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('2 new')).toBeInTheDocument();
    expect(screen.getByText('Mark all read')).toBeInTheDocument();

    expect(screen.getByText('Custom Product Update: NPD-2026-014')).toBeInTheDocument();
    expect(screen.getByText('Shipment Arrival Notice: ORD-2026-88045')).toBeInTheDocument();
    expect(screen.getByText('General Notification')).toBeInTheDocument();
    expect(screen.getAllByTestId('unread-dot')).toHaveLength(2);
  });

  it('marks a notification as read and closes popover on click', async () => {
    vi.mocked(notificationActions.markNotificationAsRead).mockResolvedValue({ success: true });

    render(
      <NotificationBell
        userId="u-1"
        initialNotifications={mockNotifications}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
    const firstNotification = screen.getByText('Custom Product Update: NPD-2026-014');
    fireEvent.click(firstNotification);

    await waitFor(() => {
      expect(notificationActions.markNotificationAsRead).toHaveBeenCalledWith('n-1');
      expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();
    });
  });

  it('supports Enter key navigation on notifications', async () => {
    vi.mocked(notificationActions.markNotificationAsRead).mockResolvedValue({ success: true });

    render(
      <NotificationBell
        userId="u-1"
        initialNotifications={mockNotifications}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
    const target = screen.getByText('General Notification').closest('div[role="button"]')!;
    fireEvent.keyDown(target, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();
    });
  });

  it('marks all notifications as read when clicking Mark all read button', async () => {
    vi.mocked(notificationActions.markAllNotificationsAsRead).mockResolvedValue({ success: true });

    render(
      <NotificationBell
        userId="u-1"
        initialNotifications={mockNotifications}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
    const markAllBtn = screen.getByRole('button', { name: /Mark all read/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(notificationActions.markAllNotificationsAsRead).toHaveBeenCalledWith('u-1');
      expect(screen.queryByTestId('notification-unread-badge')).not.toBeInTheDocument();
      expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    });
  });

  it('closes popover on outside click', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <NotificationBell
          userId="u-1"
          initialNotifications={mockNotifications}
        />
      </div>
    );

    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
    expect(screen.getByTestId('notification-popover')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();
  });

  it('closes popover on Escape key press', () => {
    render(
      <NotificationBell
        userId="u-1"
        initialNotifications={mockNotifications}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
    expect(screen.getByTestId('notification-popover')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('notification-popover')).not.toBeInTheDocument();
  });

  it('renders empty state when there are no notifications', () => {
    render(<NotificationBell userId="u-1" initialNotifications={[]} initialUnreadCount={0} />);
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
    expect(screen.getByText('No notifications right now')).toBeInTheDocument();
  });

  it('fetches notifications on mount when initialNotifications is not provided', async () => {
    vi.mocked(notificationActions.getUserNotifications).mockResolvedValue({
      success: true,
      notifications: mockNotifications,
      unreadCount: 2,
    });

    render(<NotificationBell userId="u-1" />);

    await waitFor(() => {
      expect(notificationActions.getUserNotifications).toHaveBeenCalledWith('u-1');
    });
  });
});
