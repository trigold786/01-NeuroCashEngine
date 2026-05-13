import { Injectable } from '@nestjs/common';

export interface CashFlowVelocityResponse {
  industryCode: string;
  industryName: string;
  avgTurnoverRate: number;
  avgLiquidityScore: number;
  avgPaymentCycleDays: number;
  avgReceivableCycleDays: number;
  sampleSize: number;
  periodStart: string;
  periodEnd: string;
}

interface IndustryData {
  industryCode: string;
  industryName: string;
  avgTurnoverRate: number;
  avgLiquidityScore: number;
  avgPaymentCycleDays: number;
  avgReceivableCycleDays: number;
  sampleSize: number;
}

@Injectable()
export class CashFlowVelocityService {
  private readonly mockData: IndustryData[] = [
    { industryCode: '51', industryName: '批发业', avgTurnoverRate: 68.5, avgLiquidityScore: 72.3, avgPaymentCycleDays: 45, avgReceivableCycleDays: 38, sampleSize: 1250 },
    { industryCode: '52', industryName: '零售业', avgTurnoverRate: 82.1, avgLiquidityScore: 65.8, avgPaymentCycleDays: 30, avgReceivableCycleDays: 12, sampleSize: 2340 },
    { industryCode: '61', industryName: '住宿业', avgTurnoverRate: 55.4, avgLiquidityScore: 58.2, avgPaymentCycleDays: 20, avgReceivableCycleDays: 15, sampleSize: 680 },
    { industryCode: '62', industryName: '餐饮业', avgTurnoverRate: 91.2, avgLiquidityScore: 52.6, avgPaymentCycleDays: 15, avgReceivableCycleDays: 5, sampleSize: 3150 },
    { industryCode: '71', industryName: '租赁业', avgTurnoverRate: 42.8, avgLiquidityScore: 78.5, avgPaymentCycleDays: 60, avgReceivableCycleDays: 55, sampleSize: 420 },
    { industryCode: '72', industryName: '商务服务业', avgTurnoverRate: 61.3, avgLiquidityScore: 70.1, avgPaymentCycleDays: 35, avgReceivableCycleDays: 30, sampleSize: 890 },
  ];

  async getCashFlowVelocity(industry?: string): Promise<CashFlowVelocityResponse[]> {
    const now = new Date();
    const periodEnd = now.toISOString().split('T')[0];
    const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let filtered = this.mockData;
    if (industry) {
      filtered = this.mockData.filter(d => d.industryCode === industry);
    }

    return filtered.map(d => ({
      ...d,
      periodStart,
      periodEnd,
    }));
  }
}
