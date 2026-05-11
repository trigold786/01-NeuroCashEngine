import { useEffect } from 'react';
import { useBusinessStore, SopType, EventType } from '@nce/shared';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Page } from '../App';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin);

interface BusinessCashFlowProps {
  navigateTo: (page: Page) => void;
}

export default function BusinessCashFlow({ navigateTo }: BusinessCashFlowProps) {
  const {
    forecasts,
    events,
    loading,
    error,
    fetchForecasts,
    fetchEvents,
    seedEvents,
    generateForecast,
    generateSop,
  } = useBusinessStore();

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
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#666',
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

      {error && <p style={{ color: '#cc0000', textAlign: 'center' }}>{error}</p>}

      {/* 预警横幅 */}
      {alerts.length > 0 && (
        <div style={{
          background: '#fff0f0',
          border: '1px solid #ffcccc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#cc0000', marginTop: 0, marginBottom: '12px' }}>⚠️ 预警信息</h3>
          <p>未来有 {alerts.length} 次可能的资金短缺</p>
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
      )}

      {/* 预测图表 */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>未来现金流预测</h3>
        {forecasts.length > 0 ? (
          <div style={{ maxHeight: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p style={{ color: '#999', textAlign: 'center' }}>暂无预测数据，请点击生成预测</p>
        )}
      </div>

      {/* 预警详情列表 */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0 }}>预警详情</h3>
        </div>
        <div style={{ padding: '0 20px' }}>
          {alerts.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>暂无预警</p>
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
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <div>
                    <p style={{ fontSize: '16px', marginBottom: '4px' }}>{alert.forecastDate}</p>
                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{alert.alertMessage}</p>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#cc0000', margin: 0 }}>
                    ¥{Number(alert.predictedBalance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
