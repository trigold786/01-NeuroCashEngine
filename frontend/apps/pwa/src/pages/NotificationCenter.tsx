import { useState, useEffect } from 'react';
import { Page } from '../App';
import { cashflowApiClient } from '@nce/shared';

interface NotificationItem {
  notificationId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  navigateTo: (page: Page) => void;
}

export default function NotificationCenter({ navigateTo }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await cashflowApiClient.get('/notifications') as any;
      setNotifications(res.data);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await cashflowApiClient.post(`/notifications/${id}/read`);
      loadNotifications();
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await cashflowApiClient.post('/notifications/read-all');
      loadNotifications();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await cashflowApiClient.delete(`/notifications/${id}`);
      loadNotifications();
    } catch {}
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = { alert: '预警', investment: '投资', system: '系统' };
    return map[type] || type;
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = { alert: '#ff4d4f', investment: '#52c41a', system: '#1890ff' };
    return map[type] || '#999';
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}><p>加载中...</p></div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigateTo('dashboard')}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '12px' }}
          >
            ← 返回控制台
          </button>
          <h1 style={{ margin: 0 }}>通知中心</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{ padding: '8px 16px', backgroundColor: 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            全部已读 ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🔔</p>
          <p>暂无通知</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n) => (
            <div
              key={n.notificationId}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '16px', background: n.isRead ? 'var(--bg-card)' : '#f0f5ff',
                borderRadius: '8px', boxShadow: 'var(--shadow-card)',
                border: n.isRead ? '1px solid var(--border-color)' : '1px solid #91d5ff',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getTypeColor(n.type), marginTop: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    {getTypeLabel(n.type)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {new Date(n.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '14px' }}>{n.title}</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>{n.body}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                {!n.isRead && (
                  <button onClick={() => handleMarkAsRead(n.notificationId)} style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    标为已读
                  </button>
                )}
                <button onClick={() => handleDelete(n.notificationId)} style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--semantic-red)', borderRadius: '4px', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--semantic-red)' }}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
