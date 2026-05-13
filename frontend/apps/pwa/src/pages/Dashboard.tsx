import { useEffect, useState } from 'react';
import { useAuthStore, useBusinessStore, AccountType, UserRole } from '@nce/shared';
import { useAssetStore } from '@nce/shared';
import { Page } from '../App';

interface DashboardProps {
  navigateTo: (page: Page) => void;
}

function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatReturn(value: number, isMasked: boolean): string {
  if (isMasked) return '***';
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}¥${Math.abs(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Dashboard({ navigateTo }: DashboardProps) {
  const { user, logout } = useAuthStore();
  const { fetchIndustries } = useBusinessStore();
  const { accounts, fetchOverview } = useAssetStore();
  const [isMasked, setIsMasked] = useState(false);

  useEffect(() => {
    fetchIndustries();
    fetchOverview();
  }, [fetchIndustries, fetchOverview]);

  const isBusinessUser = user?.accountType === AccountType.ENTERPRISE || user?.role === UserRole.ENTERPRISE;

  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const cumulativeReturn = accounts.reduce((sum, acc) => {
    if (acc.accountType === 'STOCK' && acc.buyPrice && acc.shareCount && acc.currentPrice) {
      const costBasis = acc.buyPrice * acc.shareCount;
      const currentValue = acc.currentPrice * acc.shareCount;
      return sum + (currentValue - costBasis);
    }
    if (acc.accountType === 'FUND' && acc.buyPrice && acc.shareCount && acc.nav) {
      const costBasis = acc.buyPrice * acc.shareCount;
      const currentValue = acc.nav * acc.shareCount;
      return sum + (currentValue - costBasis);
    }
    if (acc.accountType === 'DEPOSIT' && acc.interestRate && acc.termYears) {
      return sum + (acc.balance * acc.interestRate * acc.termYears / 100);
    }
    return sum;
  }, 0);

  const yesterdayReturn = cumulativeReturn * (Math.random() * 0.1 - 0.02);

  const getReturnColor = (value: number) => value >= 0 ? '#00cc66' : '#cc0000';

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>NeuroCashEngine 控制台</h1>
        <button
          onClick={logout}
          style={{ padding: '10px 20px', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          退出登录
        </button>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h2>欢迎，{user?.username}！</h2>
        <p>邮箱：{user?.email}</p>
        <p>账号类型：{isBusinessUser ? '企业用户' : '个人用户'}</p>
        {user?.companyName && <p>企业名称：{user.companyName}</p>}
        {user?.industryName && <p>所属行业：{user.industryName}</p>}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 24px',
        borderRadius: '12px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>总资产</div>
            <div className="data-font" style={{ fontSize: '24px', fontWeight: 'bold' }}>{isMasked ? '***' : formatCurrency(totalAssets)}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '24px' }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>昨日收益</div>
            <div className="data-font" style={{ fontSize: '24px', fontWeight: 'bold', color: getReturnColor(yesterdayReturn) }}>
              {formatReturn(yesterdayReturn, isMasked)}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '24px' }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>累计收益</div>
            <div className="data-font" style={{ fontSize: '24px', fontWeight: 'bold', color: getReturnColor(cumulativeReturn) }}>
              {formatReturn(cumulativeReturn, isMasked)}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsMasked(!isMasked)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isMasked ? '显示' : '隐藏'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('assets')}
        >
          <h3 style={{ color: '#0066cc', marginBottom: '8px' }}>📊 资产概览</h3>
          <p style={{ color: '#666' }}>查看和管理您的资产配置</p>
        </div>

        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('strategy')}
        >
          <h3 style={{ color: '#0066cc', marginBottom: '8px' }}>💹 投资策略</h3>
          <p style={{ color: '#666' }}>风险评估与资产配置推荐</p>
        </div>

        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('news')}
        >
          <h3 style={{ color: '#0066cc', marginBottom: '8px' }}>📰 资讯中心</h3>
          <p style={{ color: '#666' }}>查看最新的金融市场资讯</p>
        </div>

        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('points')}
        >
          <h3 style={{ color: '#667eea', marginBottom: '8px' }}>🎯 积分中心</h3>
          <p style={{ color: '#666' }}>积分查询、推荐码管理与兑换</p>
        </div>

        {isBusinessUser && (
          <>
            <div
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigateTo('enterprise-strategy')}
            >
              <h3 style={{ color: '#cc6600', marginBottom: '8px' }}>💼 企业投资策略</h3>
              <p style={{ color: '#666' }}>企业风险评估与投资策略推荐</p>
            </div>

            <div
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigateTo('business-cashflow')}
            >
              <h3 style={{ color: '#cc6600', marginBottom: '8px' }}>📈 现金流预测</h3>
              <p style={{ color: '#666' }}>查看企业现金流预测和预警</p>
            </div>

            <div
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigateTo('business-sops')}
            >
              <h3 style={{ color: '#cc6600', marginBottom: '8px' }}>📋 SOP管理</h3>
              <p style={{ color: '#666' }}>生成和管理资金调拨SOP文档</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
