'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  NotificationDTO,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setNotificationReadStatus,
} from '@/server/actions/notification.actions';
import { formatNotificationTimestamp } from '@/lib/utils';
import { DEFAULT_FALLBACK_NOTIFICATIONS, getFallbackUnreadCount } from '@/lib/fallback-notifications';


export interface NotificationDrawerProps {
  userId?: string;
  initialNotifications?: NotificationDTO[];
  initialUnreadCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'Just now';
}

export default function NotificationDrawer({
  userId,
  initialNotifications,
  initialUnreadCount,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: NotificationDrawerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>(
    initialNotifications || DEFAULT_FALLBACK_NOTIFICATIONS
  );
  const [unreadCount, setUnreadCount] = useState<number>(
    initialUnreadCount !== undefined
      ? initialUnreadCount
      : (initialNotifications
          ? initialNotifications.filter((n) => !n.isRead).length
          : getFallbackUnreadCount(DEFAULT_FALLBACK_NOTIFICATIONS))
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    if (userId && !initialNotifications) {
      getUserNotifications(userId)
        .then((res) => {
          if (res.success && res.notifications && res.notifications.length > 0) {
            setNotifications(res.notifications);
            setUnreadCount(res.unreadCount);
          } else {
            setNotifications(DEFAULT_FALLBACK_NOTIFICATIONS);
            setUnreadCount(getFallbackUnreadCount(DEFAULT_FALLBACK_NOTIFICATIONS));
          }
        })
        .catch(() => {
          setNotifications(DEFAULT_FALLBACK_NOTIFICATIONS);
          setUnreadCount(getFallbackUnreadCount(DEFAULT_FALLBACK_NOTIFICATIONS));
        });
    }
  }, [userId, initialNotifications]);

  // Click outside and Escape handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isControlled) {
          controlledOnClose?.();
        } else {
          setInternalIsOpen(false);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isControlled) {
          controlledOnClose?.();
        } else {
          setInternalIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isControlled, controlledOnClose]);

  const handleToggle = () => {
    if (isControlled) {
      if (isOpen) {
        controlledOnClose?.();
      }
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleItemClick = async (notification: NotificationDTO) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await markNotificationAsRead(notification.id);
    }
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleCheckboxToggle = async (e: React.MouseEvent, notification: NotificationDTO) => {
    e.stopPropagation();
    const newStatus = !notification.isRead;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: newStatus } : n))
    );
    setUnreadCount((prev) => Math.max(0, newStatus ? prev - 1 : prev + 1));
    await setNotificationReadStatus(notification.id, newStatus);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    if (userId) {
      await markAllNotificationsAsRead(userId);
    }
  };

  const filteredNotifications = showOnlyUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const isAllRead = notifications.length > 0 && notifications.every((n) => n.isRead);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      data-testid="notification-bell-container"
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        data-testid="notification-bell-button"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: 'var(--border-radius-pill)',
          backgroundColor: isOpen ? 'var(--color-surface-hover)' : 'transparent',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
          transition: 'var(--transition-fast)',
        }}
      >
        {/* Bell Icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span
            data-testid="notification-unread-badge"
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: 'var(--color-error, #dc2626)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--color-surface, #ffffff)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Notification Center"
          data-testid="notification-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '380px',
            maxHeight: '520px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 'var(--spacing-md)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-background-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-primary-light, rgba(14, 116, 144, 0.1))',
                    color: 'var(--color-primary, #0e7490)',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--border-radius-pill)',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Show only unread toggle switch */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                role="switch"
                aria-checked={showOnlyUnread}
                data-testid="show-unread-toggle"
                checked={showOnlyUnread}
                onChange={(e) => setShowOnlyUnread(e.target.checked)}
                style={{
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary, #0e7490)',
                }}
              />
              <span>Show only unread</span>
            </label>
          </div>

          {/* Subheader with Mark all read button */}
          {unreadCount > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '6px var(--spacing-md)',
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.05))',
              }}
            >
              <button
                type="button"
                data-testid="mark-all-read-btn"
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-primary, #0e7490)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              maxHeight: '360px',
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: 'var(--spacing-xl)',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {showOnlyUnread ? 'No unread notifications' : 'No notifications right now'}
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const dateDisplay =
                  formatNotificationTimestamp(item.createdAt) || formatRelativeTime(item.createdAt);

                const itemBody = (
                  <div
                    key={item.id}
                    data-testid={`notification-item-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleItemClick(item);
                      }
                    }}
                    style={{
                      padding: 'var(--spacing-md)',
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: item.isRead
                        ? 'transparent'
                        : 'var(--color-primary-light, rgba(14, 116, 144, 0.04))',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 'var(--spacing-sm)',
                      alignItems: 'flex-start',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {/* Read/Unread checkbox */}
                    <input
                      type="checkbox"
                      data-testid={`notification-checkbox-${item.id}`}
                      aria-label={`Mark as ${item.isRead ? 'unread' : 'read'}`}
                      checked={item.isRead}
                      onClick={(e) => handleCheckboxToggle(e, item)}
                      onChange={() => {}}
                      style={{
                        marginTop: '4px',
                        cursor: 'pointer',
                        accentColor: 'var(--color-primary, #0e7490)',
                      }}
                    />

                    {/* Red unread indicator dot */}
                    {!item.isRead && (
                      <span
                        data-testid="unread-dot"
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-error, #dc2626)',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          gap: '6px',
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: item.isRead ? 600 : 700,
                            color: 'var(--color-text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.title}
                        </h4>
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'var(--color-text-tertiary)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dateDisplay}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.message}
                      </p>

                      {item.link && (
                        <div style={{ marginTop: '6px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--color-primary, #0e7490)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>Open details</span>
                            <span aria-hidden="true">&rarr;</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );

                return item.link ? (
                  <Link
                    key={item.id}
                    href={item.link}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {itemBody}
                  </Link>
                ) : (
                  itemBody
                );
              })
            )}
          </div>

          {/* Bottom Footer with Check all master checkbox */}
          <div
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                data-testid="check-all-notifications"
                checked={isAllRead}
                disabled={notifications.length === 0}
                onChange={handleMarkAllRead}
                style={{
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary, #0e7490)',
                }}
              />
              <span>Check all</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
