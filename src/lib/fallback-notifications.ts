import { NotificationDTO } from '@/server/actions/notification.actions';

export const DEFAULT_FALLBACK_NOTIFICATIONS: NotificationDTO[] = [
  {
    id: 'notif-fb-1',
    userId: 'usr-default',
    title: 'Shipment Vessel Berthed: Order #ORD-2026-88204',
    message:
      'Vessel MSC Bhavya has berthed at Jebel Ali Port (Berth 12). Reefer container TEMU-782910-3 is ready for customs clearance and SFDA inspection.',
    link: '/shipments/shipment-1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
  },
  {
    id: 'notif-fb-2',
    userId: 'usr-default',
    title: 'SFDA Slaughterhouse License Renewal Approved',
    message:
      'SFDA Certificate for Al-Dua Food Processing Plant (APEDA #78) has been renewed through 2028. Updated veterinary clearance documents are in your Licenses vault.',
    link: '/settings/licenses',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: 'notif-fb-3',
    userId: 'usr-default',
    title: 'Custom Product Update: NPD-2026-014',
    message:
      'Your tailored brief for Halal Frozen Boneless Buffalo Striploin (450g Retail Skin-Pack) has advanced to the Laboratory Sensory Analysis stage.',
    link: '/customized-products',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
  },
  {
    id: 'notif-fb-4',
    userId: 'usr-default',
    title: 'Commercial Credit Note Issued: CR-1044',
    message:
      'Quality assurance claim CLM-2026-004 has been approved. Credit Note #CR-1044 ($1,280.00 USD) has been credited to LuLu Hypermarket LLC statement.',
    link: '/claims/claim-4',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 1 day ago
  },
];

/**
 * Returns fallback notifications filtered optionally by userId
 */
export function getFallbackNotifications(userId?: string): NotificationDTO[] {
  if (!userId) return DEFAULT_FALLBACK_NOTIFICATIONS;
  return DEFAULT_FALLBACK_NOTIFICATIONS.map((n) => ({
    ...n,
    userId,
  }));
}

/**
 * Calculate unread count from a list of notifications or the default fallback set
 */
export function getFallbackUnreadCount(notifications: NotificationDTO[] = DEFAULT_FALLBACK_NOTIFICATIONS): number {
  return notifications.filter((n) => !n.isRead).length;
}
