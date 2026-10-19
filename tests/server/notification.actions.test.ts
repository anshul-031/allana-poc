import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as notificationActions from '@/server/actions/notification.actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    shipment: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('notification.actions Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatNotificationTimestamp', () => {
    it('returns empty string on null, undefined, or empty input', () => {
      expect(notificationActions.formatNotificationTimestamp(null)).toBe('');
      expect(notificationActions.formatNotificationTimestamp(undefined)).toBe('');
      expect(notificationActions.formatNotificationTimestamp('')).toBe('');
    });

    it('returns empty string on invalid date string', () => {
      expect(notificationActions.formatNotificationTimestamp('not-a-valid-date')).toBe('');
    });

    it('formats valid ISO date string correctly', () => {
      const date = new Date(2026, 9, 19, 14, 30, 45); // 19 Oct 2026 14:30:45
      const res = notificationActions.formatNotificationTimestamp(date.toISOString());
      expect(res).toBe('19.10.2026 14:30:45');
    });

    it('formats valid Date object correctly', () => {
      const date = new Date(2026, 0, 5, 8, 5, 9); // 05 Jan 2026 08:05:09
      const res = notificationActions.formatNotificationTimestamp(date);
      expect(res).toBe('05.01.2026 08:05:09');
    });
  });

  describe('getUserNotifications', () => {
    it('returns error if userId is missing', async () => {
      const res = await notificationActions.getUserNotifications('');
      expect(res.success).toBe(false);
      expect(res.error).toBe('User ID is required');
    });

    it('successfully fetches notifications and calculates unreadCount', async () => {
      const mockRecords = [
        {
          id: 'n-1',
          userId: 'u-1',
          title: 'Shipment Update',
          message: 'Vessel arrived',
          link: '/shipments',
          isRead: false,
          createdAt: new Date('2026-10-18T10:00:00Z'),
        },
        {
          id: 'n-2',
          userId: 'u-1',
          title: 'Claim Update',
          message: 'Claim accepted',
          link: '/claims',
          isRead: true,
          createdAt: new Date('2026-10-17T10:00:00Z'),
        },
      ];

      vi.mocked(prisma.notification.findMany).mockResolvedValue(mockRecords as any);

      const res = await notificationActions.getUserNotifications('u-1');
      expect(res.success).toBe(true);
      expect(res.notifications).toHaveLength(2);
      expect(res.unreadCount).toBe(1);
      expect(res.notifications[0].title).toBe('Shipment Update');
    });

    it('handles unexpected exceptions and returns error message', async () => {
      vi.mocked(prisma.notification.findMany).mockRejectedValue(new Error('DB Timeout'));

      const res = await notificationActions.getUserNotifications('u-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('DB Timeout');
    });

    it('handles non-Error exceptions gracefully', async () => {
      vi.mocked(prisma.notification.findMany).mockRejectedValue('Fatal string error');

      const res = await notificationActions.getUserNotifications('u-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch notifications');
    });
  });

  describe('markNotificationAsRead', () => {
    it('returns error if notificationId is missing', async () => {
      const res = await notificationActions.markNotificationAsRead('');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Notification ID is required');
    });

    it('successfully updates notification and revalidates dashboard', async () => {
      vi.mocked(prisma.notification.update).mockResolvedValue({ id: 'n-1', isRead: true } as any);

      const res = await notificationActions.markNotificationAsRead('n-1');
      expect(res.success).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-1' },
        data: { isRead: true },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('handles unexpected update errors', async () => {
      vi.mocked(prisma.notification.update).mockRejectedValue(new Error('Update failed'));

      const res = await notificationActions.markNotificationAsRead('n-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Update failed');
    });

    it('handles non-Error exceptions gracefully', async () => {
      vi.mocked(prisma.notification.update).mockRejectedValue('Unknown error');

      const res = await notificationActions.markNotificationAsRead('n-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to update notification');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('returns error if userId is missing', async () => {
      const res = await notificationActions.markAllNotificationsAsRead('');
      expect(res.success).toBe(false);
      expect(res.error).toBe('User ID is required');
    });

    it('successfully marks all unread notifications as read', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 3 } as any);

      const res = await notificationActions.markAllNotificationsAsRead('u-1');
      expect(res.success).toBe(true);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u-1', isRead: false },
        data: { isRead: true },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('handles updateMany errors', async () => {
      vi.mocked(prisma.notification.updateMany).mockRejectedValue(new Error('Bulk update failed'));

      const res = await notificationActions.markAllNotificationsAsRead('u-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Bulk update failed');
    });

    it('handles non-Error exceptions gracefully', async () => {
      vi.mocked(prisma.notification.updateMany).mockRejectedValue('Unknown error');

      const res = await notificationActions.markAllNotificationsAsRead('u-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to mark all notifications as read');
    });
  });

  describe('createNotification', () => {
    it('returns error if required fields are missing', async () => {
      const res1 = await notificationActions.createNotification({ userId: '', title: 'Test', message: 'Msg' });
      expect(res1.success).toBe(false);
      expect(res1.error).toBe('User ID, title, and message are required');

      const res2 = await notificationActions.createNotification({ userId: 'u-1', title: '', message: 'Msg' });
      expect(res2.success).toBe(false);

      const res3 = await notificationActions.createNotification({ userId: 'u-1', title: 'Test', message: '' });
      expect(res3.success).toBe(false);
    });

    it('creates notification and returns DTO', async () => {
      vi.mocked(prisma.notification.create).mockResolvedValue({
        id: 'n-new',
        userId: 'u-1',
        title: 'New Alert',
        message: 'Something happened',
        link: '/claims',
        isRead: false,
        createdAt: new Date('2026-10-19T12:00:00Z'),
      } as any);

      const res = await notificationActions.createNotification({
        userId: 'u-1',
        title: 'New Alert',
        message: 'Something happened',
        link: '/claims',
      });

      expect(res.success).toBe(true);
      expect(res.notification?.id).toBe('n-new');
      expect(res.notification?.title).toBe('New Alert');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('handles create failure gracefully', async () => {
      vi.mocked(prisma.notification.create).mockRejectedValue(new Error('DB insert error'));

      const res = await notificationActions.createNotification({
        userId: 'u-1',
        title: 'New Alert',
        message: 'Something happened',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('DB insert error');
    });

    it('handles non-Error thrown in createNotification', async () => {
      vi.mocked(prisma.notification.create).mockRejectedValue('create error');

      const res = await notificationActions.createNotification({
        userId: 'u-1',
        title: 'New Alert',
        message: 'Something happened',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to create notification');
    });
  });

  describe('setNotificationReadStatus', () => {
    it('returns error if notificationId is missing', async () => {
      const res = await notificationActions.setNotificationReadStatus('', true);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Notification ID is required');
    });

    it('successfully sets status to false (unread)', async () => {
      vi.mocked(prisma.notification.update).mockResolvedValue({ id: 'n-1', isRead: false } as any);

      const res = await notificationActions.setNotificationReadStatus('n-1', false);
      expect(res.success).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-1' },
        data: { isRead: false },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('handles update status failure gracefully', async () => {
      vi.mocked(prisma.notification.update).mockRejectedValue(new Error('Failed status'));

      const res = await notificationActions.setNotificationReadStatus('n-1', true);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed status');
    });

    it('handles non-Error thrown in setNotificationReadStatus', async () => {
      vi.mocked(prisma.notification.update).mockRejectedValue('fail');

      const res = await notificationActions.setNotificationReadStatus('n-1', true);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to update notification status');
    });
  });

  describe('checkAndGenerateShipmentArrivalNotifications', () => {
    it('returns error if companyId or userId is missing', async () => {
      const res1 = await notificationActions.checkAndGenerateShipmentArrivalNotifications({
        companyId: '',
        userId: 'u-1',
      });
      expect(res1.success).toBe(false);
      expect(res1.count).toBe(0);

      const res2 = await notificationActions.checkAndGenerateShipmentArrivalNotifications({
        companyId: 'comp-1',
        userId: '',
      });
      expect(res2.success).toBe(false);
      expect(res2.count).toBe(0);
    });

    it('processes 14-day alert and docking alert correctly without duplicating', async () => {
      const now = Date.now();
      const mockShipments = [
        {
          id: 's-1',
          orderNumber: 'ORD-8801',
          companyId: 'comp-1',
          portOfDestination: 'Jeddah Port',
          shippingLine: 'Maersk',
          vesselName: 'Maersk Seletar',
          status: 'IN_TRANSIT',
          eta: new Date(now + 10 * 24 * 60 * 60 * 1000), // in 10 days (<= 14 days)
        },
        {
          id: 's-2',
          orderNumber: 'ORD-8802',
          companyId: 'comp-1',
          portOfDestination: 'Dammam Port',
          shippingLine: 'MSC',
          vesselName: null,
          status: 'ARRIVED_PORT', // Docked
          eta: new Date(now - 1 * 24 * 60 * 60 * 1000), // ETA was yesterday
        },
        {
          id: 's-invalid-date',
          orderNumber: 'ORD-INVALID',
          companyId: 'comp-1',
          portOfDestination: 'Riyadh',
          shippingLine: 'CMA CGM',
          vesselName: null,
          status: 'IN_TRANSIT',
          eta: new Date('invalid-date'),
        },
      ];

      vi.mocked(prisma.shipment.findMany).mockResolvedValue(mockShipments as any);
      // For s-1: no existing notification
      // For s-2: already existing notification for docked
      vi.mocked(prisma.notification.findFirst).mockImplementation((({ where }: any) => {
        if (where.title.includes('ORD-8802')) {
          return Promise.resolve({ id: 'existing-doc' } as any);
        }
        return Promise.resolve(null);
      }) as any);

      vi.mocked(prisma.notification.create).mockResolvedValue({ id: 'created-1' } as any);

      const res = await notificationActions.checkAndGenerateShipmentArrivalNotifications({
        companyId: 'comp-1',
        userId: 'u-1',
      });

      expect(res.success).toBe(true);
      expect(res.count).toBe(1); // Only ORD-8801 was created
      expect(prisma.notification.create).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('creates docking notification when vessel status is DELIVERED and no duplicate exists', async () => {
      const now = Date.now();
      const mockShipments = [
        {
          id: 's-del',
          orderNumber: 'ORD-DEL',
          companyId: 'comp-1',
          portOfDestination: 'Dubai Port',
          shippingLine: 'Hapag-Lloyd',
          vesselName: null,
          status: 'DELIVERED',
          eta: new Date(now + 20 * 24 * 60 * 60 * 1000), // Future ETA but already marked DELIVERED
        },
      ];

      vi.mocked(prisma.shipment.findMany).mockResolvedValue(mockShipments as any);
      vi.mocked(prisma.notification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.notification.create).mockResolvedValue({ id: 'created-del' } as any);

      const res = await notificationActions.checkAndGenerateShipmentArrivalNotifications({
        companyId: 'comp-1',
        userId: 'u-1',
      });

      expect(res.success).toBe(true);
      expect(res.count).toBe(1);
    });

    it('handles query error gracefully', async () => {
      vi.mocked(prisma.shipment.findMany).mockRejectedValue(new Error('Shipment DB error'));

      const res = await notificationActions.checkAndGenerateShipmentArrivalNotifications({
        companyId: 'comp-1',
        userId: 'u-1',
      });

      expect(res.success).toBe(false);
      expect(res.count).toBe(0);
      expect(res.error).toBe('Shipment DB error');
    });

    it('handles non-Error thrown gracefully', async () => {
      vi.mocked(prisma.shipment.findMany).mockRejectedValue('Shipment DB error string');

      const res = await notificationActions.checkAndGenerateShipmentArrivalNotifications({
        companyId: 'comp-1',
        userId: 'u-1',
      });

      expect(res.success).toBe(false);
      expect(res.count).toBe(0);
      expect(res.error).toBe('Failed to generate shipment notifications');
    });
  });
});
