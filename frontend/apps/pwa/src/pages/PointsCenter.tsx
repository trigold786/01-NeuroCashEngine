import { useState, useEffect } from 'react';
import { Page } from '../App';
import { cashflowApiClient } from '@nce/shared';

interface PointsData {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface PointsRecord {
  recordId: string;
  amount: number;
  reason: string;
  description: string | null;
  referralUserId: string | null;
  createdAt: string;
}

interface ReferralCodeData {
  referralId: string;
  code: string;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

interface PointsCenterProps {
  navigateTo: (page: Page) => void;
}

export default function PointsCenter({ navigateTo }: PointsCenterProps) {
  const [points, setPoints] = useState<PointsData | null>(null);
  const [referralCode, setReferralCode] = useState<ReferralCodeData | null>(null);
  const [history, setHistory] = useState<PointsRecord[]>([]);
  const [redeemInput, setRedeemInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balanceRes, codeRes, historyRes] = await Promise.all([
        cashflowApiClient.get('/points/balance'),
        cashflowApiClient.get('/points/referral/code'),
        cashflowApiClient.get('/points/history'),
      ]);
      setPoints((balanceRes as any).data);
      setReferralCode((codeRes as any).data);
      setHistory((historyRes as any).data);
    } catch (err: any) {
      setMessage('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      const res = await cashflowApiClient.post('/points/referral/generate');
      setReferralCode((res as any).data);
      setMessage('推荐码生成成功！');
    } catch (err: any) {
      setMessage('生成推荐码失败');
    }
  };

  const handleRedeem = async () => {
    if (!redeemInput.trim()) return;
    try {
      const res = await cashflowApiClient.post('/points/referral/redeem', { code: redeemInput.trim() });
      const data = (res as any).data;
      setPoints(data.newUser);
      setMessage(`兑换成功！获得50积分！`);
      setRedeemInput('');
      loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || '兑换失败，推荐码无效');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('推荐码已复制！');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigateTo('dashboard')}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px',
            padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '12px',
          }}
        >
          ← 返回控制台
        </button>
        <h1 style={{ margin: 0 }}>积分中心</h1>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff',
          borderRadius: '6px', marginBottom: '16px', color: 'var(--brand-blue)',
        }}>
          {message}
          <button onClick={() => setMessage(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--brand-blue)' }}>×</button>
        </div>
      )}

      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px', borderRadius: '12px', marginBottom: '24px', color: 'white',
      }}>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 8px' }}>可用积分</p>
        <p className="data-font" style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px' }}>
          {points?.balance ?? 0}
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 4px' }}>累计获得</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{points?.totalEarned ?? 0}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 4px' }}>累计使用</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{points?.totalSpent ?? 0}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ margin: '0 0 12px', color: 'var(--brand-blue)' }}>我的推荐码</h3>
          {referralCode ? (
            <div>
              <div style={{
                padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px',
                fontFamily: 'monospace', fontSize: '24px', textAlign: 'center',
                letterSpacing: '4px', marginBottom: '8px', cursor: 'pointer',
              }}
                onClick={() => copyToClipboard(referralCode.code)}
                title="点击复制"
              >
                {referralCode.code}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>
                已使用 {referralCode.usedCount} 次 | 点击复制
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              style={{
                padding: '12px 24px', backgroundColor: '#0066cc', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%',
              }}
            >
              生成推荐码
            </button>
          )}
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', margin: '8px 0 0' }}>
            推荐好友注册，您获得100积分，好友获得50积分
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ margin: '0 0 12px', color: 'var(--brand-gold)' }}>兑换推荐码</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={redeemInput}
              onChange={(e) => setRedeemInput(e.target.value)}
              placeholder="输入8位推荐码"
              maxLength={8}
              style={{
                flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px',
                fontFamily: 'monospace', fontSize: '16px', letterSpacing: '2px',
              }}
            />
            <button
              onClick={handleRedeem}
              disabled={redeemInput.length < 8}
              style={{
                padding: '10px 20px', backgroundColor: redeemInput.length >= 8 ? '#cc6600' : '#ccc',
                color: 'white', border: 'none', borderRadius: '4px', cursor: redeemInput.length >= 8 ? 'pointer' : 'not-allowed',
              }}
            >
              兑换
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>积分记录</h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>暂无积分记录</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((record) => (
              <div key={record.recordId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px',
              }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: '500' }}>
                    {record.reason === 'referral' ? '推荐奖励' : record.reason === 'signin' ? '签到奖励' : record.reason === 'redeem' ? '积分兑换' : record.reason}
                  </p>
                  {record.description && (
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{record.description}</p>
                  )}
                  <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '11px' }}>
                    {new Date(record.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <span className="data-font" style={{
                  fontSize: '20px', fontWeight: 'bold',
                  color: record.amount > 0 ? 'var(--semantic-green)' : 'var(--semantic-red)',
                }}>
                  {record.amount > 0 ? '+' : ''}{record.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
