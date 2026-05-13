import { useState, useEffect } from 'react';
import { Page } from '../App';
import { cashflowApiClient } from '@nce/shared';

interface PlanData {
  subscriptionId: string;
  tier: string;
  status: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  features: Record<string, any> | null;
}

interface TierInfo {
  tier: string;
  name: string;
  price: number;
  features: string[];
}

interface SubscriptionProps {
  navigateTo: (page: Page) => void;
}

const TIER_NAMES: Record<string, string> = { free: '免费版', premium: '高级版', enterprise: '企业版' };
const TIER_COLORS: Record<string, string> = { free: '#999', premium: '#52c41a', enterprise: '#722ed1' };

export default function Subscription({ navigateTo }: SubscriptionProps) {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [availableTiers, setAvailableTiers] = useState<TierInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const res = await cashflowApiClient.get('/subscription/plan') as any;
      setPlan(res.data);
      setAvailableTiers(res.availableTiers || []);
    } catch {
      setMessage('加载订阅信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const res = await cashflowApiClient.post('/subscription/upgrade', { tier }) as any;
      setPlan(res.data);
      setMessage(`成功升级到${TIER_NAMES[tier] || tier}！`);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || '升级失败');
    }
  };

  const handleCancel = async () => {
    try {
      const res = await cashflowApiClient.post('/subscription/cancel') as any;
      setPlan(res.data);
      setMessage('订阅已取消');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || '取消失败');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}><p>加载中...</p></div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigateTo('dashboard')}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '12px' }}
        >
          ← 返回控制台
        </button>
        <h1 style={{ margin: 0 }}>订阅中心</h1>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px', color: 'var(--brand-blue)' }}>
          {message}
          <button onClick={() => setMessage(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--brand-blue)' }}>×</button>
        </div>
      )}

      {plan && (
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px', borderRadius: '12px', marginBottom: '24px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 8px' }}>当前套餐</p>
              <h2 style={{ margin: '0 0 8px', fontSize: '28px' }}>{TIER_NAMES[plan.tier] || plan.tier}</h2>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>
                状态: {plan.status === 'active' ? '使用中' : plan.status === 'cancelled' ? '已取消' : plan.status}
                {plan.endDate && ` | 到期: ${plan.endDate}`}
                {plan.autoRenew && ' | 自动续费'}
              </p>
            </div>
            {plan.tier !== 'free' && plan.status === 'active' && (
              <button
                onClick={handleCancel}
                style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', cursor: 'pointer' }}
              >
                取消订阅
              </button>
            )}
          </div>
        </div>
      )}

      {plan?.tier === 'free' && (
        <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#d46b08' }}>
          <strong>💡 升级提示：</strong> 升级到高级版获取更多功能，包括认证资讯和高级策略分析
        </div>
      )}

      <h3 style={{ marginBottom: '16px' }}>套餐对比</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {availableTiers.map((tier) => {
          const isCurrent = plan?.tier === tier.tier;
          return (
            <div
              key={tier.tier}
              style={{
                background: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow-card)',
                padding: '24px', border: isCurrent ? `2px solid ${TIER_COLORS[tier.tier]}` : '1px solid var(--border-color)',
                position: 'relative',
              }}
            >
              {isCurrent && (
                <span style={{ position: 'absolute', top: '12px', right: '12px', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: TIER_COLORS[tier.tier], color: 'white' }}>
                  当前
                </span>
              )}
              <h3 style={{ margin: '0 0 8px', color: TIER_COLORS[tier.tier] }}>{tier.name}</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 16px' }}>
                ¥{tier.price}<span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/月</span>
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                {tier.features.map((f) => (
                  <li key={f} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    ✓ {f === 'basic_asset_overview' ? '基础资产概览' : f === 'official_news' ? '官方资讯' : f === 'verified_news' ? '认证资讯' : f === 'advanced_strategy' ? '高级策略分析' : f === 'api_access' ? 'API 访问' : f === 'portfolio_monitoring' ? '组合监控' : f === 'cash_flow_forecast' ? '现金流预测' : f}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <button
                  onClick={() => handleUpgrade(tier.tier)}
                  disabled={tier.tier === 'free'}
                  style={{
                    width: '100%', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    backgroundColor: TIER_COLORS[tier.tier], color: 'white', fontSize: '16px', fontWeight: '600',
                    opacity: tier.tier === 'free' ? 0.5 : 1,
                  }}
                >
                  {tier.tier === 'free' ? '当前版本' : '升级'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
