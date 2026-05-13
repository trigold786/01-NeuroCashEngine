import { useEffect, useState } from 'react';
import { useBusinessStore, SopType, EventType } from '@nce/shared';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Page } from '../App';
import BottomSheet from '../components/BottomSheet';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin);

interface BusinessCashFlowProps {
  navigateTo: (page: Page) => void;
}

const SOP_CARDS = [
  {
    id: 'redeem',
    icon: '🔄',
    title: '短期理财赎回',
    desc: '赎回即将到期的短期理财产品，补充流动资金缺口',
    sopType: SopType.SHORTAGE,
  },
  {
    id: 'supply-chain',
    icon: '🔗',
    title: '供应链金融借款',
    desc: '基于应收账款申请供应链金融融资，快速获取资金',
    sopType: SopType.LOAN_DUE,
  },
  {
    id: 'internal-transfer',
    icon: '🏢',
    title: '内部资金调拨',
    desc: '从其他账户调拨闲置资金，优化资金使用效率',
    sopType: SopType.SURPLUS,
  },
];

export default function BusinessCashFlow({ navigateTo }: BusinessCashFlowProps) {
  const {
    forecasts,
    events,
    sops,
    loading,
    error,
    fetchForecasts,
    fetchEvents,
    seedEvents,
    generateForecast,
    generateSop,
  } = useBusinessStore();
  const [showSopSheet, setShowSopSheet] = useState(false);
  const [selectedSopCard, setSelectedSopCard] = useState<string | null>(null);

  useEffect(() => {
    fetchForecasts();
    fetchEvents();
  }, [fetchForecasts, fetchEvents]);

  const eventTypeLabels: Record<EventType, string> = {
    [EventType.TAX_DUE]: '税费缴纳',
    [EventType.PAYDAY]: '发薪日',
    [EventType.CONTRACT_PAYMENT]: '合同付款',
    [EventType.LOAN_DUE]: '贷款到期',
    [EventType.RECEIVABLE_DUE]: '应收账款',
  };

  const eventTypeColors: Record<EventType, string> = {
    [EventType.TAX_DUE]: '#ff6b6b',
    [EventType.PAYDAY]: '#4ecdc4',
    [EventType.CONTRACT_PAYMENT]: '#45b7d1',
    [EventType.LOAN_DUE]: '#f7b731',
    [EventType.RECEIVABLE_DUE]: '#a55ee4',
  };

  const chartData = {
    labels: forecasts.map(f => f.forecastDate),
    datasets: [
      {
        label: '预测余额',
        data: forecasts.map(f => Number(f.predictedBalance)),
        borderColor: '#0066cc',
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (events.length > 0 && forecasts.length > 0) {
    const annotations: any = {};
    events.forEach((event, index) => {
      const forecastIndex = forecasts.findIndex(f => f.forecastDate === event.eventDate);
      if (forecastIndex !== -1) {
        annotations[`event-${index}`] = {
          type: 'point',
          xValue: forecastIndex,
          yValue: Number(forecasts[forecastIndex].predictedBalance),
          backgroundColor: eventTypeColors[event.eventType],
          borderColor: eventTypeColors[event.eventType],
          borderWidth: 2,
          radius: 8,
          label: {
            display: true,
            content: eventTypeLabels[event.eventType],
            position: 'bottom',
            color: eventTypeColors[event.eventType],
            font: { size: 10 },
          },
        };
      }
    });
    chartOptions.plugins.annotation = { annotations };
  }

  const alerts = forecasts.filter(f => f.isAlert);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <button
            onClick={() => navigateTo('dashboard')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              marginBottom: '8px'
            }}
          >
            ← 返回控制台
          </button>
          <h1 style={{ margin: 0 }}>现金流预测</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => seedEvents()}
            disabled={loading}
            style={{
              padding: '10px 24px',
              backgroundColor: '#45b7d1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1
            }}
          >
            加载示例事件
          </button>
          <button
            onClick={() => generateForecast({ forecastDays: 90 })}
            disabled={loading}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '生成中...' : '重新生成预测'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--semantic-red)', textAlign: 'center' }}>{error}</p>}

      {/* 预警横幅 */}
      {alerts.length > 0 && (
        (() => {
          const nearestAlert = alerts.reduce((earliest, a) =>
            new Date(a.forecastDate) < new Date(earliest.forecastDate) ? a : earliest
          );
          const today = new Date();
          const alertDate = new Date(nearestAlert.forecastDate);
          const daysDiff = Math.ceil((alertDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return (
          <div style={{
            background: '#fff0f0',
            border: '1px solid #ffcccc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: 'var(--semantic-red)', marginTop: 0, marginBottom: '12px' }}>⚠️ 预警信息</h3>
            <p>未来有 {alerts.length} 次可能的资金短缺</p>
            <p className="data-font" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--semantic-red)', margin: '12px 0' }}>
              ⏰ 预计 {daysDiff} 天后存在 ¥{Number(nearestAlert.predictedBalance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })} 资金缺口
            </p>
          <button
            onClick={() => generateSop({ type: SopType.SHORTAGE })}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#cc0000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            生成应对SOP
          </button>
        </div>
          );
        })()
      )}

      {/* 预测图表 */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>未来现金流预测</h3>
        {forecasts.length > 0 ? (
          <div style={{ maxHeight: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>暂无预测数据，请点击生成预测</p>
        )}
      </div>

      {/* SOP建议卡片 */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>💡 SOP建议方案</h3>
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          padding: '16px 20px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}>
          {SOP_CARDS.map((card) => (
            <div
              key={card.id}
              style={{
                minWidth: '240px',
                maxWidth: '260px',
                flexShrink: 0,
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{card.icon}</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{card.title}</h4>
              <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>{card.desc}</p>
              <button
                onClick={async () => {
                  setSelectedSopCard(card.title);
                  await generateSop({ type: card.sopType });
                  setShowSopSheet(true);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  width: '100%',
                }}
              >
                查看方案
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 预警详情列表 */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>预警详情</h3>
        </div>
        <div style={{ padding: '0 20px' }}>
          {alerts.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>暂无预警</p>
          ) : (
            <div style={{ padding: '16px 0' }}>
              {alerts.map((alert) => (
                <div
                  key={alert.forecastId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <p style={{ fontSize: '16px', marginBottom: '4px' }}>{alert.forecastDate}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{alert.alertMessage}</p>
                  </div>
                  <p className="data-font" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--semantic-red)', margin: 0 }}>
                    ¥{Number(alert.predictedBalance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SOP详情 BottomSheet */}
      <BottomSheet isOpen={showSopSheet} onClose={() => setShowSopSheet(false)}>
        <h3 style={{ margin: '0 0 16px 0' }}>{selectedSopCard} - SOP方案</h3>
        {sops.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sops.slice(0, 1).map((sop) => (
              <div key={sop.sopId}>
                <h4 style={{ margin: '0 0 8px 0', color: '#0066cc' }}>{sop.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
                  创建时间：{new Date(sop.createdAt).toLocaleString('zh-CN')}
                </p>
                <div style={{
                  lineHeight: '1.6',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                }}>
                  {sop.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>正在生成SOP方案...</p>
        )}
      </BottomSheet>
    </div>
  );
}
