import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@nce/shared';

interface Notification {
  notificationId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function AlertBanner() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('nce_access_token');
      const baseUrl = (import.meta as any).env?.VITE_CASHFLOW_API_URL || 'http://localhost:3005';
      const res = await fetch(`${baseUrl}/notifications?unreadOnly=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setUnreadCount(json.unreadCount || 0);
        setNotifications(json.data || []);
      }
    } catch {
      // silently fail
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          fontSize: '18px',
          color: 'var(--text-primary)',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: 'var(--semantic-red)',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 999,
            }}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              fontWeight: '600',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}>
              通知 ({unreadCount} 条未读)
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                暂无通知
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.notificationId} style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('nce_access_token');
                      const baseUrl = (import.meta as any).env?.VITE_CASHFLOW_API_URL || 'http://localhost:3005';
                      await fetch(`${baseUrl}/notifications/${n.notificationId}/read`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      fetchNotifications();
                    } catch { /* ignore */ }
                  }}
                >
                  <div style={{ fontWeight: '500', fontSize: '13px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {n.body}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
