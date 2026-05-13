import { Injectable, Logger } from '@nestjs/common';

export interface Holding {
  productId: string;
  productName: string;
  type: 'CASH' | 'DEPOSIT' | 'FUND' | 'STOCK' | 'BOND';
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  targetAllocation: number;
  deviation: number;
}

export interface Alert {
  id: string;
  type: 'deviation' | 'market' | 'rebalance' | 'stop';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  dailyPnl: number;
  riskLevel: string;
  diversification: number;
}

export interface PortfolioPerformance {
  date: string;
  value: number;
  pnl: number;
}

const MOCK_HOLDINGS: Holding[] = [
  { productId: 'P-CASH-001', productName: '活期存款', type: 'CASH', shares: 1, avgCost: 500000, currentPrice: 500000, marketValue: 500000, pnl: 0, pnlPercent: 0, allocation: 25, targetAllocation: 15, deviation: 10 },
  { productId: 'P-DEP-001', productName: '结构性存款', type: 'DEPOSIT', shares: 1, avgCost: 400000, currentPrice: 403200, marketValue: 403200, pnl: 3200, pnlPercent: 0.8, allocation: 20.16, targetAllocation: 30, deviation: -9.84 },
  { productId: 'P-FUND-001', productName: '短债基金', type: 'FUND', shares: 35000, avgCost: 10.5, currentPrice: 10.85, marketValue: 379750, pnl: 12250, pnlPercent: 3.33, allocation: 18.99, targetAllocation: 25, deviation: -6.01 },
  { productId: 'P-FUND-002', productName: '混合基金', type: 'FUND', shares: 20000, avgCost: 15.2, currentPrice: 16.08, marketValue: 321600, pnl: 17600, pnlPercent: 5.79, allocation: 16.08, targetAllocation: 15, deviation: 1.08 },
  { productId: 'P-STK-001', productName: '贵州茅台', type: 'STOCK', shares: 500, avgCost: 185.0, currentPrice: 178.5, marketValue: 89250, pnl: -3250, pnlPercent: -3.51, allocation: 4.46, targetAllocation: 10, deviation: -5.54 },
  { productId: 'P-BND-001', productName: '国债ETF', type: 'BOND', shares: 30000, avgCost: 10.2, currentPrice: 10.35, marketValue: 310500, pnl: 4500, pnlPercent: 1.47, allocation: 15.53, targetAllocation: 5, deviation: 10.53 },
];

const MOCK_ALERTS: Alert[] = [
  { id: 'ALT-001', type: 'deviation', severity: 'warning', title: '现金配置偏离', description: '现金类资产配置比例25%，超出目标15%达10个百分点', createdAt: new Date(Date.now() - 2 * 3600000), acknowledged: false },
  { id: 'ALT-002', type: 'deviation', severity: 'warning', title: '债券配置偏离', description: '债券类资产配置比例15.53%，超出目标5%达10.53个百分点', createdAt: new Date(Date.now() - 4 * 3600000), acknowledged: false },
  { id: 'ALT-003', type: 'market', severity: 'info', title: '市场波动提醒', description: '本周A股市场波动加剧，建议关注持仓风险', createdAt: new Date(Date.now() - 86400000), acknowledged: false },
  { id: 'ALT-004', type: 'rebalance', severity: 'critical', title: '再平衡提醒', description: '投资组合偏离度过大，建议执行再平衡操作', createdAt: new Date(Date.now() - 3 * 86400000), acknowledged: false },
  { id: 'ALT-005', type: 'stop', severity: 'warning', title: '贵州茅台止损预警', description: '贵州茅台浮亏3.51%，接近止损线5%', createdAt: new Date(Date.now() - 5 * 86400000), acknowledged: true },
];

function generatePerformanceHistory(period: string): PortfolioPerformance[] {
  const now = Date.now();
  const points: { [key: string]: number } = { '1w': 7, '1m': 30, '3m': 90, '6m': 180, '1y': 365 };
  const days = points[period] || 30;
  const result: PortfolioPerformance[] = [];
  let value = 1800000;
  for (let i = days; i >= 0; i--) {
    const change = value * (Math.random() - 0.48) * 0.02;
    value = value + change;
    const date = new Date(now - i * 86400000);
    result.push({ date: date.toISOString().split('T')[0], value: Math.round(value), pnl: Math.round(value - 1800000) });
  }
  return result;
}

@Injectable()
export class PortfolioMonitoringService {
  private readonly logger = new Logger(PortfolioMonitoringService.name);

  getPortfolio(userId: string): { summary: PortfolioSummary; holdings: Holding[] } {
    const holdings = MOCK_HOLDINGS.map(h => ({ ...h }));
    const totalValue = holdings.reduce((s, h) => s + h.marketValue, 0);
    const totalCost = holdings.reduce((s, h) => s + h.avgCost * h.shares, 0);
    const totalPnl = holdings.reduce((s, h) => s + h.pnl, 0);
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const dailyPnl = totalValue * (Math.random() - 0.45) * 0.005;

    this.logger.log(`Portfolio fetched for userId=${userId}`);

    return {
      summary: {
        totalValue,
        totalCost,
        totalPnl,
        totalPnlPercent: Math.round(totalPnlPercent * 100) / 100,
        dailyPnl: Math.round(dailyPnl),
        riskLevel: '中等',
        diversification: 72,
      },
      holdings,
    };
  }

  getAlerts(userId: string): Alert[] {
    this.logger.log(`Alerts fetched for userId=${userId}`);
    return MOCK_ALERTS.map(a => ({ ...a }));
  }

  acknowledgeAlert(userId: string, alertId: string): { success: boolean } {
    this.logger.log(`Alert ${alertId} acknowledged by userId=${userId}`);
    return { success: true };
  }

  getPerformance(userId: string, period: string): PortfolioPerformance[] {
    this.logger.log(`Performance fetched for userId=${userId}, period=${period}`);
    return generatePerformanceHistory(period);
  }
}
