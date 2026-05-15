import { useState } from 'react';
import { useAuthStore, cashflowApiClient } from '@nce/shared';
import { Page } from '../App';

interface UserSettingsProps {
  navigateTo: (page: Page) => void;
  currentTheme: string;
  onToggleTheme: () => void;
}

export default function UserSettings({ navigateTo, currentTheme, onToggleTheme }: UserSettingsProps) {
  const { user, logout } = useAuthStore();
  const [message, setMessage] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigateTo('login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('确定要注销账户吗？此操作不可恢复。')) return;
    if (!window.confirm('再次确认：所有数据将被永久删除。')) return;
    try {
      await cashflowApiClient.delete('/api/users/delete');
      logout();
      navigateTo('login');
    } catch {
      setMessage('账户注销失败，请联系客服');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigateTo('dashboard')} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px',
        padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '16px',
      }}>← 返回控制台</button>

      <h1 style={{ marginBottom: '24px' }}>用户中心</h1>

      {message && (
        <div style={{ padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', marginBottom: '16px' }}>
          {message}
          <button onClick={() => setMessage(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', borderRadius: '8px', boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>👤 账户信息</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <p><strong>用户名：</strong>{user?.username}</p>
          <p><strong>邮箱：</strong>{user?.email}</p>
          <p><strong>账户类型：</strong>{user?.accountType === 'enterprise' ? '企业用户' : '个人用户'}</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '8px', boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>🎨 显示风格</h3>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>当前主题：<strong>{currentTheme === 'dark' ? '深色模式' : '浅色模式'}</strong></span>
          <button onClick={onToggleTheme} style={{
            padding: '8px 20px', backgroundColor: 'var(--brand-blue)', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}>切换主题</button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '8px', boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>🔔 通知设置</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span>现金流预警通知</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>已启用</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span>投资策略推送</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>已启用</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>资讯更新通知</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>已启用</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '8px', boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>⚠️ 账户操作</h3>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={handleLogout} style={{
            padding: '10px', backgroundColor: '#cc6600', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%',
          }}>退出登录</button>
          <button onClick={handleDeleteAccount} style={{
            padding: '10px', backgroundColor: 'var(--semantic-red)', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%',
          }}>注销账户（不可恢复）</button>
        </div>
      </div>
    </div>
  );
}
