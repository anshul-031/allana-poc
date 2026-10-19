'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string; // ISO string
}

export interface GetNotificationsResult {
  success: boolean;
  notifications: NotificationDTO[];
  unreadCount: number;
  error?: string;
}

/**
 * Fetch all notifications for a user, sorted by recency
 */
export async function getUserNotifications(userId?: string): Promise<GetNotificationsResult> {
  if (!userId) {
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: 'User ID is required',
    };
  }

  try {
    const records = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const notifications: NotificationDTO[] = records.map((n: (typeof records)[number]) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: message,
    };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!notificationId) {
    return { success: false, error: 'Notification ID is required' };
  }

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    try {
      revalidatePath('/dashboard');
    } catch {
      // Graceful in tests
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update notification';
    return { success: false, error: message };
  }
}

/**
 * Mark all notifications as read for a given user
 */
export async function markAllNotificationsAsRead(userId?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    try {
      revalidatePath('/dashboard');
    } catch {
      // Graceful in tests
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
    return { success: false, error: message };
  }
}

/**
 * Format timestamp into DD.MM.YYYY HH:MM:SS format
 */
export function formatNotificationTimestamp(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  link?: string | null;
}): Promise<{
  success: boolean;
  notification?: NotificationDTO;
  error?: string;
}> {
  if (!data.userId || !data.title || !data.message) {
    return { success: false, error: 'User ID, title, and message are required' };
  }

  try {
    const record = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        link: data.link || null,
        isRead: false,
      },
    });

    try {
      revalidatePath('/dashboard');
    } catch {
      // Graceful in tests
    }

    return {
      success: true,
      notification: {
        id: record.id,
        userId: record.userId,
        title: record.title,
        message: record.message,
        link: record.link,
        isRead: record.isRead,
        createdAt: record.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create notification';
    return { success: false, error: message };
  }
}

/**
 * Set read/unread status of a notification
 */
export async function setNotificationReadStatus(
  notificationId: string,
  isRead: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!notificationId) {
    return { success: false, error: 'Notification ID is required' };
  }

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead },
    });

    try {
      revalidatePath('/dashboard');
    } catch {
      // Graceful in tests
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update notification status';
    return { success: false, error: message };
  }
}

/**
 * Evaluate shipment milestones and create automated arrival notifications:
 * - 14 days before vessel ETA
 * - On vessel docking day (ETA <= today or ARRIVED/DELIVERED status)
 */
export async function checkAndGenerateShipmentArrivalNotifications(params: {
  companyId: string;
  userId: string;
}): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  if (!params.companyId || !params.userId) {
    return {
      success: false,
      count: 0,
      error: 'Company ID and User ID are required',
    };
  }

  try {
    const shipments = await prisma.shipment.findMany({
      where: {
        companyId: params.companyId,
      },
    });

    let createdCount = 0;
    const now = new Date();

    for (const shipment of shipments) {
      const etaDate = new Date(shipment.eta);
      if (isNaN(etaDate.getTime())) continue;

      const diffMs = etaDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Milestone 1: Exactly or within 14 days prior to ETA
      if (diffDays <= 14 && diffDays > 0) {
        const title14 = `Shipment ETA Alert: Order #${shipment.orderNumber}`;
        const existing14 = await prisma.notification.findFirst({
          where: {
            userId: params.userId,
            title: title14,
          },
        });

        if (!existing14) {
          const dateStr = formatNotificationTimestamp(etaDate).split(' ')[0];
          await prisma.notification.create({
            data: {
              userId: params.userId,
              title: title14,
              message: `Vessel ${shipment.vesselName || shipment.shippingLine} is scheduled to arrive at ${shipment.portOfDestination} in ${diffDays} days (ETA: ${dateStr}).`,
              link: `/shipments?search=${shipment.orderNumber}`,
              isRead: false,
            },
          });
          createdCount++;
        }
      }

      // Milestone 2: On docking day or vessel arrival
      if (diffDays <= 0 || shipment.status === 'ARRIVED_PORT' || shipment.status === 'DELIVERED') {
        const titleDocked = `Shipment Docked: Order #${shipment.orderNumber}`;
        const existingDocked = await prisma.notification.findFirst({
          where: {
            userId: params.userId,
            title: titleDocked,
          },
        });

        if (!existingDocked) {
          await prisma.notification.create({
            data: {
              userId: params.userId,
              title: titleDocked,
              message: `Vessel has docked at ${shipment.portOfDestination}. Containers are ready for customs clearance.`,
              link: `/shipments?search=${shipment.orderNumber}`,
              isRead: false,
            },
          });
          createdCount++;
        }
      }
    }

    if (createdCount > 0) {
      try {
        revalidatePath('/dashboard');
      } catch {
        // Graceful in tests
      }
    }

    return {
      success: true,
      count: createdCount,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate shipment notifications';
    return {
      success: false,
      count: 0,
      error: message,
    };
  }
}
