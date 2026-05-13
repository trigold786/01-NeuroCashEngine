import { Injectable } from '@nestjs/common';

export interface NSICrossData {
  userId: string;
  financialHealthScore: number;
  riskProfile: string;
  avgMonthlySavings: number;
  insuranceCoverage: string;
  investmentCapacity: string;
}

export interface CrossDataOverview {
  totalUsers: number;
  avgHealthScore: number;
  riskDistribution: { profile: string; count: number; percentage: number }[];
  insuranceDistribution: { coverage: string; count: number; percentage: number }[];
  investmentDistribution: { capacity: string; count: number; percentage: number }[];
}

export interface HealthDistribution {
  range: string;
  count: number;
  percentage: number;
}

@Injectable()
export class NSICrossDataService {
  private readonly mockData: NSICrossData[] = [
    { userId: 'anon-001', financialHealthScore: 82, riskProfile: 'conservative', avgMonthlySavings: 3500, insuranceCoverage: 'full', investmentCapacity: 'medium' },
    { userId: 'anon-002', financialHealthScore: 45, riskProfile: 'aggressive', avgMonthlySavings: 1200, insuranceCoverage: 'minimal', investmentCapacity: 'low' },
    { userId: 'anon-003', financialHealthScore: 68, riskProfile: 'moderate', avgMonthlySavings: 2800, insuranceCoverage: 'partial', investmentCapacity: 'medium' },
    { userId: 'anon-004', financialHealthScore: 91, riskProfile: 'conservative', avgMonthlySavings: 8000, insuranceCoverage: 'full', investmentCapacity: 'high' },
    { userId: 'anon-005', financialHealthScore: 55, riskProfile: 'aggressive', avgMonthlySavings: 1500, insuranceCoverage: 'minimal', investmentCapacity: 'low' },
    { userId: 'anon-006', financialHealthScore: 73, riskProfile: 'moderate', avgMonthlySavings: 3200, insuranceCoverage: 'partial', investmentCapacity: 'medium' },
    { userId: 'anon-007', financialHealthScore: 38, riskProfile: 'aggressive', avgMonthlySavings: 800, insuranceCoverage: 'minimal', investmentCapacity: 'low' },
    { userId: 'anon-008', financialHealthScore: 86, riskProfile: 'conservative', avgMonthlySavings: 5500, insuranceCoverage: 'full', investmentCapacity: 'high' },
    { userId: 'anon-009', financialHealthScore: 62, riskProfile: 'moderate', avgMonthlySavings: 2100, insuranceCoverage: 'partial', investmentCapacity: 'medium' },
    { userId: 'anon-010', financialHealthScore: 77, riskProfile: 'conservative', avgMonthlySavings: 4200, insuranceCoverage: 'full', investmentCapacity: 'high' },
  ];

  async getCrossDataOverview(): Promise<CrossDataOverview> {
    const total = this.mockData.length;
    const avgHealth = this.mockData.reduce((s, d) => s + d.financialHealthScore, 0) / total;

    const riskMap = new Map<string, number>();
    const insuranceMap = new Map<string, number>();
    const investmentMap = new Map<string, number>();

    for (const d of this.mockData) {
      riskMap.set(d.riskProfile, (riskMap.get(d.riskProfile) || 0) + 1);
      insuranceMap.set(d.insuranceCoverage, (insuranceMap.get(d.insuranceCoverage) || 0) + 1);
      investmentMap.set(d.investmentCapacity, (investmentMap.get(d.investmentCapacity) || 0) + 1);
    }

    const toDistribution = (map: Map<string, number>) =>
      Array.from(map.entries()).map(([key, count]) => ({
        [key.includes('profile') ? 'profile' : key.includes('coverage') ? 'coverage' : 'capacity']: key,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      }));

    return {
      totalUsers: total,
      avgHealthScore: Math.round(avgHealth * 10) / 10,
      riskDistribution: Array.from(riskMap.entries()).map(([profile, count]) => ({ profile, count, percentage: Math.round((count / total) * 1000) / 10 })),
      insuranceDistribution: Array.from(insuranceMap.entries()).map(([coverage, count]) => ({ coverage, count, percentage: Math.round((count / total) * 1000) / 10 })),
      investmentDistribution: Array.from(investmentMap.entries()).map(([capacity, count]) => ({ capacity, count, percentage: Math.round((count / total) * 1000) / 10 })),
    };
  }

  async getHealthDistribution(): Promise<HealthDistribution[]> {
    const ranges = [
      { label: '0-20', min: 0, max: 20 },
      { label: '21-40', min: 21, max: 40 },
      { label: '41-60', min: 41, max: 60 },
      { label: '61-80', min: 61, max: 80 },
      { label: '81-100', min: 81, max: 100 },
    ];

    const total = this.mockData.length;
    return ranges.map(range => {
      const count = this.mockData.filter(d => d.financialHealthScore >= range.min && d.financialHealthScore <= range.max).length;
      return { range: range.label, count, percentage: Math.round((count / total) * 1000) / 10 };
    });
  }
}
