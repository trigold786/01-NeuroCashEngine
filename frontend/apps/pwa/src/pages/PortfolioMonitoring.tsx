import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Page } from '../App';
import { portfolioApi, PortfolioSummary, Holding, Alert, PortfolioPerformance } from '@nce/shared';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PortfolioMonitoringProps {
  navigateTo: (page: Page) => void;
}

function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

const TYPE_NAMES: Record<string, string> = { CASH: '现金', DEPOSIT: '存款', FUND: '基金', STOCK: '股票', BOND: '债券' };
const SEVERITY_COLORS: Record<string, string> = { info: 'var(--brand-blue)', warning: '#cc6600', critical: 'var(--semantic-red)' };
const SEVERITY_BG: Record<string, string> = { info: '#e6f7ff', warning: '#fff7e6', critical: '#fff1f0' };
const PERIOD_OPTIONS = [
  { value: '1w', label: '1周' },
  { value: '1m', label: '1月' },
  { value: '3m', label: '3月' },
  { value: '6m', label: '6月' },
  { value: '1y', label: '1年' },
];

export default function PortfolioMonitoring({ navigateTo }: PortfolioMonitoringProps) {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [performance, setPerformance] = useState<PortfolioPerformance[]>([]);
  const [period, setPeriod] = useState('1m');
  const [loading, setLoading] = useState(true);
  const [rebalanceMsg, setRebalanceMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [portfolioRes, alertsData, perfData] = await Promise.all([
        portfolioApi.getPortfolio(),
        portfolioApi.getAlerts(),
        portfolioApi.getPerformance(period),
      ]);
      setSummary(portfolioRes.summary);
      setHoldings(portfolioRes.holdings);
      setAlerts(alertsData);
      setPerformance(perfData);
    } catch (err) {
      console.error('Failed to load portfolio data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await portfolioApi.acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  };

  const handleRebalance = () => {
    setRebalanceMsg('再平衡建议已生成：建议减持现金类资产10%，增持存款类资产9.84%，以回归目标配置比例。');
  };

  const getLineData = () => {
    if (!performance.length) return null;
    return {
      labels: performance.map(p => p.date),
      datasets: [
        {
          label: '组合净值',
          data: performance.map(p => p.value),
          borderColor: '#0066cc',
          backgroundColor: 'rgba(0, 102, 204, 0.1)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: '组合净值走势', font: { size: 16 } },
    },
    scales: {
      y: { ticks: { callback: (v: any) => `¥${(v / 10000).toFixed(0)}万` } },
    },
  };

  const getPnlColor = (value: number) => value >= 0 ? 'var(--semantic-green)' : 'var(--semantic-red)';

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigateTo('dashboard')} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px',
          padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '12px',
        }}>
          ← 返回控制台
        </button>
        <h1 style={{ margin: 0 }}>组合监控中心</h1>
      </div>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card label="总资产" value={formatCurrency(summary.totalValue)} color="#0066cc" />
          <Card label="累计盈亏" value={formatCurrency(summary.totalPnl)} color={getPnlColor(summary.totalPnl)} suffix={`(${formatPct(summary.totalPnlPercent)})`} />
          <Card label="日盈亏" value={formatCurrency(summary.dailyPnl)} color={getPnlColor(summary.dailyPnl)} />
          <Card label="风险等级" value={summary.riskLevel} color="#cc6600" />
          <Card label="分散度评分" value={`${summary.diversification}/100`} color="#667eea" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>持仓明细</h3>
            <button onClick={handleRebalance} style={{
              padding: '8px 20px', border: 'none', borderRadius: '4px',
              background: '#0066cc', color: 'white', cursor: 'pointer', fontSize: '14px',
            }}>
              生成再平衡建议
            </button>
          </div>
          {rebalanceMsg && (
            <div style={{ padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', color: 'var(--brand-blue)' }}>
              {rebalanceMsg}
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-tertiary)' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>产品名称</th>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>类型</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>持仓数量</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>成本价</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>当前价</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>市值</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>盈亏</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>偏离度</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => (
                <tr key={h.productId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 4px', fontWeight: 500 }}>{h.productName}</td>
                  <td style={{ padding: '10px 4px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
                      backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                    }}>
                      {TYPE_NAMES[h.type] || h.type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right' }}>{h.shares.toLocaleString()}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'right' }}>{formatCurrency(h.avgCost)}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'right' }}>{formatCurrency(h.currentPrice)}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'right' }}>{formatCurrency(h.marketValue)}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', color: getPnlColor(h.pnl) }}>
                    {formatCurrency(h.pnl)}<br /><span style={{ fontSize: '11px' }}>({formatPct(h.pnlPercent)})</span>
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', color: Math.abs(h.deviation) > 5 ? 'var(--semantic-red)' : 'var(--semantic-green)' }}>
                    {h.deviation > 0 ? '+' : ''}{h.deviation.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-card)', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>预警信息</h3>
            {alerts.length === 0 && <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>暂无预警</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.filter(a => !a.acknowledged).map(alert => (
                <div key={alert.id} style={{
                  padding: '12px', borderRadius: '6px',
                  backgroundColor: SEVERITY_BG[alert.severity] || 'var(--bg-secondary)',
                  borderLeft: `3px solid ${SEVERITY_COLORS[alert.severity] || 'var(--text-tertiary)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{alert.title}</span>
                    <span style={{
                      fontSize: '11px', padding: '1px 6px', borderRadius: '4px',
                      backgroundColor: SEVERITY_COLORS[alert.severity],
                      color: 'white',
                    }}>
                      {alert.severity === 'info' ? '提示' : alert.severity === 'warning' ? '警告' : '严重'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-secondary)' }}>{alert.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {new Date(alert.createdAt).toLocaleString('zh-CN')}
                    </span>
                    <button onClick={() => handleAcknowledge(alert.id)} style={{
                      padding: '4px 12px', border: '1px solid var(--border-color)', borderRadius: '4px',
                      background: 'var(--bg-card)', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)',
                    }}>
                      已知晓
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {alerts.some(a => a.acknowledged) && (
              <details style={{ marginTop: '16px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  已处理 ({alerts.filter(a => a.acknowledged).length})
                </summary>
                {alerts.filter(a => a.acknowledged).map(alert => (
                  <div key={alert.id} style={{
                    padding: '8px', marginTop: '8px', borderRadius: '4px',
                    backgroundColor: 'var(--bg-secondary)', fontSize: '12px',
                  }}>
                    <div style={{ fontWeight: 500 }}>{alert.title}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{new Date(alert.createdAt).toLocaleString('zh-CN')}</div>
                  </div>
                ))}
              </details>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>组合表现</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PERIOD_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setPeriod(opt.value)} style={{
                padding: '4px 12px', border: '1px solid var(--border-color)', borderRadius: '4px',
                background: period === opt.value ? '#0066cc' : 'white',
                color: period === opt.value ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '13px',
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {getLineData() && <Line data={getLineData()!} options={lineOptions} />}
      </div>
    </div>
  );
}

function Card({ label, value, color, suffix }: { label: string; value: string; color: string; suffix?: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', padding: '20px', borderRadius: '8px',
      boxShadow: 'var(--shadow-card)', textAlign: 'center',
    }}>
      <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px', fontSize: '14px' }}>{label}</p>
      <p className="data-font" style={{ fontSize: '22px', fontWeight: 'bold', color, margin: 0 }}>
        {value}
        {suffix && <span style={{ fontSize: '13px', fontWeight: 'normal', marginLeft: '4px' }}>{suffix}</span>}
      </p>
    </div>
  );
}
