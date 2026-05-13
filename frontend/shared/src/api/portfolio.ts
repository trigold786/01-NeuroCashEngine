import { cashflowApiClient } from './client';

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
  createdAt: string;
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

export interface PortfolioResponse {
  summary: PortfolioSummary;
  holdings: Holding[];
}

export const portfolioApi = {
  async getPortfolio(): Promise<PortfolioResponse> {
    return await cashflowApiClient.get('/enterprise/portfolio');
  },

  async getAlerts(): Promise<Alert[]> {
    return await cashflowApiClient.get('/enterprise/portfolio/alerts');
  },

  async acknowledgeAlert(id: string): Promise<{ success: boolean }> {
    return await cashflowApiClient.post(`/enterprise/portfolio/alerts/${id}/acknowledge`);
  },

  async getPerformance(period: string): Promise<PortfolioPerformance[]> {
    return await cashflowApiClient.get('/enterprise/portfolio/performance', { params: { period } });
  },
};
