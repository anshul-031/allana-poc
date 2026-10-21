import { describe, it, expect } from 'vitest';
import {
  DEFAULT_FALLBACK_NOTIFICATIONS,
  getFallbackNotifications,
  getFallbackUnreadCount,
} from '@/lib/fallback-notifications';

describe('Fallback Notifications Store', () => {
  it('provides default fallback notifications with 4 items', () => {
    expect(DEFAULT_FALLBACK_NOTIFICATIONS).toHaveLength(4);
    expect(DEFAULT_FALLBACK_NOTIFICATIONS.every((n) => n.id && n.title && n.message)).toBe(true);
  });

  it('calculates unread count accurately', () => {
    const unread = getFallbackUnreadCount();
    expect(unread).toBe(4);

    const partialRead = [
      { ...DEFAULT_FALLBACK_NOTIFICATIONS[0], isRead: true },
      { ...DEFAULT_FALLBACK_NOTIFICATIONS[1], isRead: false },
    ];
    expect(getFallbackUnreadCount(partialRead)).toBe(1);
  });

  it('maps custom userId onto fallback notifications', () => {
    const customUserNotifs = getFallbackNotifications('user-test-999');
    expect(customUserNotifs).toHaveLength(4);
    expect(customUserNotifs.every((n) => n.userId === 'user-test-999')).toBe(true);
  });

  it('returns default fallback notifications if no userId is passed', () => {
    const defaultNotifs = getFallbackNotifications();
    expect(defaultNotifs).toEqual(DEFAULT_FALLBACK_NOTIFICATIONS);
  });
});
