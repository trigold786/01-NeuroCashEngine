import { Injectable } from '@nestjs/common';

export interface PreferenceDistribution {
  assetCategory: string;
  avgAllocation: number;
  userCount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RiskProfileDistribution {
  profile: string;
  percentage: number;
  userCount: number;
}

export interface ProductPreferenceResponse {
  region: string;
  totalUsers: number;
  preferenceDistribution: PreferenceDistribution[];
  riskProfileDistribution: RiskProfileDistribution[];
}

interface RegionData {
  region: string;
  totalUsers: number;
  preferenceDistribution: PreferenceDistribution[];
  riskProfileDistribution: RiskProfileDistribution[];
}

@Injectable()
export class ProductPreferenceService {
  private readonly mockData: RegionData[] = [
    {
      region: 'east',
      totalUsers: 45600,
      preferenceDistribution: [
        { assetCategory: 'CASH', avgAllocation: 25.3, userCount: 42300, trend: 'down' },
        { assetCategory: 'DEPOSIT', avgAllocation: 35.8, userCount: 38900, trend: 'stable' },
        { assetCategory: 'FUND', avgAllocation: 22.5, userCount: 28500, trend: 'up' },
        { assetCategory: 'STOCK', avgAllocation: 16.4, userCount: 19200, trend: 'up' },
      ],
      riskProfileDistribution: [
        { profile: 'conservative', percentage: 45.2, userCount: 20600 },
        { profile: 'moderate', percentage: 35.6, userCount: 16200 },
        { profile: 'aggressive', percentage: 19.2, userCount: 8800 },
      ],
    },
    {
      region: 'central',
      totalUsers: 31200,
      preferenceDistribution: [
        { assetCategory: 'CASH', avgAllocation: 30.1, userCount: 28900, trend: 'stable' },
        { assetCategory: 'DEPOSIT', avgAllocation: 38.4, userCount: 26500, trend: 'stable' },
        { assetCategory: 'FUND', avgAllocation: 18.7, userCount: 15200, trend: 'up' },
        { assetCategory: 'STOCK', avgAllocation: 12.8, userCount: 10100, trend: 'down' },
      ],
      riskProfileDistribution: [
        { profile: 'conservative', percentage: 52.3, userCount: 16300 },
        { profile: 'moderate', percentage: 32.1, userCount: 10000 },
        { profile: 'aggressive', percentage: 15.6, userCount: 4900 },
      ],
    },
    {
      region: 'west',
      totalUsers: 18900,
      preferenceDistribution: [
        { assetCategory: 'CASH', avgAllocation: 28.7, userCount: 17200, trend: 'down' },
        { assetCategory: 'DEPOSIT', avgAllocation: 40.2, userCount: 15800, trend: 'up' },
        { assetCategory: 'FUND', avgAllocation: 19.3, userCount: 9800, trend: 'up' },
        { assetCategory: 'STOCK', avgAllocation: 11.8, userCount: 6200, trend: 'stable' },
      ],
      riskProfileDistribution: [
        { profile: 'conservative', percentage: 48.7, userCount: 9200 },
        { profile: 'moderate', percentage: 33.5, userCount: 6300 },
        { profile: 'aggressive', percentage: 17.8, userCount: 3400 },
      ],
    },
    {
      region: 'north',
      totalUsers: 27800,
      preferenceDistribution: [
        { assetCategory: 'CASH', avgAllocation: 26.5, userCount: 25400, trend: 'down' },
        { assetCategory: 'DEPOSIT', avgAllocation: 36.9, userCount: 23100, trend: 'stable' },
        { assetCategory: 'FUND', avgAllocation: 21.2, userCount: 16300, trend: 'up' },
        { assetCategory: 'STOCK', avgAllocation: 15.4, userCount: 11800, trend: 'up' },
      ],
      riskProfileDistribution: [
        { profile: 'conservative', percentage: 43.8, userCount: 12200 },
        { profile: 'moderate', percentage: 36.2, userCount: 10100 },
        { profile: 'aggressive', percentage: 20.0, userCount: 5500 },
      ],
    },
    {
      region: 'south',
      totalUsers: 35400,
      preferenceDistribution: [
        { assetCategory: 'CASH', avgAllocation: 24.1, userCount: 32600, trend: 'down' },
        { assetCategory: 'DEPOSIT', avgAllocation: 34.5, userCount: 29800, trend: 'stable' },
        { assetCategory: 'FUND', avgAllocation: 24.8, userCount: 22100, trend: 'up' },
        { assetCategory: 'STOCK', avgAllocation: 16.6, userCount: 15400, trend: 'up' },
      ],
      riskProfileDistribution: [
        { profile: 'conservative', percentage: 41.5, userCount: 14700 },
        { profile: 'moderate', percentage: 37.8, userCount: 13400 },
        { profile: 'aggressive', percentage: 20.7, userCount: 7300 },
      ],
    },
  ];

  async getProductPreference(region?: string): Promise<ProductPreferenceResponse[]> {
    let filtered = this.mockData;
    if (region) {
      filtered = this.mockData.filter(d => d.region === region);
    }
    return filtered;
  }
}
