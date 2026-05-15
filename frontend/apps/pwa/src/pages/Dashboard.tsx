import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore, useBusinessStore, AccountType, UserRole, useNewsStore, NewsCategory } from '@nce/shared';
import { useAssetStore } from '@nce/shared';
import { Page } from '../App';

interface DashboardProps {
  navigateTo: (page: Page) => void;
  setCurrentNewsId?: (id: string) => void;
}

function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatReturn(value: number, isMasked: boolean): string {
  if (isMasked) return '***';
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}¥${Math.abs(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Dashboard({ navigateTo, setCurrentNewsId }: DashboardProps) {
  const { user, logout } = useAuthStore();
  const { fetchIndustries, generateForecast } = useBusinessStore();
  const { accounts, fetchOverview } = useAssetStore();
  const { newsList, fetchNewsList } = useNewsStore();
  const [isMasked, setIsMasked] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await generateForecast({ forecastDays: 90 });
      setLastRefresh(new Date());
    } catch { /* ignore */ }
    setIsRefreshing(false);
  }, [generateForecast]);

  useEffect(() => {
    if (autoRefresh) {
      handleManualRefresh();
      refreshTimerRef.current = setInterval(handleManualRefresh, 300000);
    } else {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [autoRefresh, handleManualRefresh]);

  useEffect(() => {
    fetchIndustries();
    fetchOverview();
    fetchNewsList({ limit: 5 });
    const interval = setInterval(() => fetchNewsList({ limit: 5 }), 600000);
    return () => clearInterval(interval);
  }, [fetchIndustries, fetchOverview, fetchNewsList]);

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

  const getReturnColor = (value: number) => value >= 0 ? 'var(--semantic-green)' : 'var(--semantic-red)';

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
          style={{ padding: '10px 20px', backgroundColor: 'var(--semantic-red)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          退出登录
        </button>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="data-font" style={{ fontSize: '24px', fontWeight: 'bold' }}>{isMasked ? '***' : formatCurrency(totalAssets)}</div>
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: 'var(--brand-gold)', color: '#fff' }}>VIP</span>
            </div>
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
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('assets')}
        >
          <h3 style={{ color: 'var(--brand-blue)', marginBottom: '8px' }}>📊 资产概览</h3>
          <p style={{ color: 'var(--text-secondary)' }}>查看和管理您的资产配置</p>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('strategy')}
        >
          <h3 style={{ color: 'var(--brand-blue)', marginBottom: '8px' }}>💹 投资策略</h3>
          <p style={{ color: 'var(--text-secondary)' }}>风险评估与资产配置推荐</p>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('news')}
        >
          <h3 style={{ color: 'var(--brand-blue)', marginBottom: '8px' }}>📰 资讯中心</h3>
          <p style={{ color: 'var(--text-secondary)' }}>查看最新的金融市场资讯</p>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('subscription')}
        >
          <h3 style={{ color: 'var(--brand-gold)', marginBottom: '8px' }}>👑 订阅中心</h3>
          <p style={{ color: 'var(--text-secondary)' }}>管理套餐、升级与功能权限</p>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('points')}
        >
          <h3 style={{ color: '#667eea', marginBottom: '8px' }}>🎯 积分中心</h3>
          <p style={{ color: 'var(--text-secondary)' }}>积分查询、推荐码管理与兑换</p>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => navigateTo('api-playground')}
        >
          <h3 style={{ color: '#00cc66', marginBottom: '8px' }}>🔌 开放平台</h3>
          <p style={{ color: 'var(--text-secondary)' }}>API文档、开发者工具与在线测试</p>
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
              onClick={() => navigateTo('portfolio-monitoring')}
            >
              <h3 style={{ color: 'var(--brand-blue)', marginBottom: '8px' }}>📊 组合监控</h3>
              <p style={{ color: 'var(--text-secondary)' }}>实时监控组合持仓、盈亏与偏离度</p>
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
              onClick={() => navigateTo('enterprise-strategy')}
            >
              <h3 style={{ color: '#cc6600', marginBottom: '8px' }}>💼 企业投资策略</h3>
              <p style={{ color: 'var(--text-secondary)' }}>企业风险评估与投资策略推荐</p>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigateTo('business-cashflow')}
            >
              <h3 style={{ color: '#cc6600', marginBottom: '8px' }}>📈 现金流预测</h3>
              <p style={{ color: 'var(--text-secondary)' }}>查看企业现金流预测和预警</p>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigateTo('business-sops')}
            >
              <h3 style={{ color: '#cc6600', marginBottom: '8px' }}>📋 SOP管理</h3>
              <p style={{ color: 'var(--text-secondary)' }}>生成和管理资金调拨SOP文档</p>
            </div>
          </>
        )}
      </div>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginTop: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0 }}>📰 最新资讯</h3>
          <button
            onClick={() => navigateTo('news')}
            style={{
              padding: '4px 12px',
              border: '1px solid #0066cc',
              borderRadius: '4px',
              background: 'var(--bg-card)',
              color: 'var(--brand-blue)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            查看全部
          </button>
        </div>
        <div style={{ padding: '0 20px' }}>
          {newsList.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0', margin: 0 }}>暂无资讯</p>
          ) : (
            newsList.slice(0, 5).map((news) => (
              <div
                key={news.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (setCurrentNewsId) setCurrentNewsId(news.id);
                  navigateTo('news-detail');
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '1px 6px',
                      fontSize: '11px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                    }}>
                      {news.category === NewsCategory.GENERAL ? '综合' : news.category === NewsCategory.STOCK ? '股票' : news.category === NewsCategory.FUND ? '基金' : news.category === NewsCategory.BOND ? '债券' : '宏观'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{news.sourceName}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {news.title}
                  </p>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                  {news.publishTime ? new Date(news.publishTime).toLocaleDateString('zh-CN') : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 自动刷新设置 */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginTop: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0 }}>⏱️ 数据刷新设置</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <span style={{ fontWeight: '500' }}>自动刷新 (每5分钟)</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {lastRefresh ? `上次刷新: ${lastRefresh.toLocaleTimeString('zh-CN')}` : '尚未刷新'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                style={{
                  padding: '6px 16px',
                  borderRadius: '4px',
                  border: '1px solid #0066cc',
                  background: 'var(--bg-card)',
                  color: 'var(--brand-blue)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  opacity: isRefreshing ? 0.7 : 1,
                }}
              >
                {isRefreshing ? '刷新中...' : '立即刷新'}
              </button>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0, left: 0, right: 0, bottom: 0,
                    borderRadius: '24px',
                    backgroundColor: autoRefresh ? '#0066cc' : '#ccc',
                    transition: '0.3s',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: autoRefresh ? '24px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                  }} />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 - 合规链接 */}
      <div style={{
        marginTop: '32px',
        padding: '16px 0',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '8px' }}>
          <button
            onClick={() => navigateTo('privacy')}
            style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
          >
            隐私政策
          </button>
          <button
            onClick={() => navigateTo('terms')}
            style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
          >
            服务条款
          </button>
          <button
            onClick={() => navigateTo('api-playground')}
            style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
          >
            开放平台
          </button>
        </div>
        <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '11px' }}>
          © 2026 NeuroCashEngine. All rights reserved.
        </p>
      </div>
    </div>
  );
}
