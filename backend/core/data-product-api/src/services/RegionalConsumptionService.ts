import { Injectable } from '@nestjs/common';

export interface TopCategory {
  category: string;
  percentage: number;
}

export interface RegionalConsumptionResponse {
  region: string;
  quarter: string;
  vitalityIndex: number;
  consumptionGrowth: number;
  topCategories: TopCategory[];
  sampleSize: number;
}

interface RegionData {
  region: string;
  quarter: string;
  vitalityIndex: number;
  consumptionGrowth: number;
  topCategories: TopCategory[];
  sampleSize: number;
}

@Injectable()
export class RegionalConsumptionService {
  private readonly mockData: RegionData[] = [
    { region: 'east', quarter: '2026Q1', vitalityIndex: 78.5, consumptionGrowth: 5.2, topCategories: [{ category: '餐饮', percentage: 28.5 }, { category: '数码产品', percentage: 22.3 }, { category: '服饰', percentage: 18.7 }], sampleSize: 45600 },
    { region: 'central', quarter: '2026Q1', vitalityIndex: 65.3, consumptionGrowth: 3.8, topCategories: [{ category: '餐饮', percentage: 32.1 }, { category: '日用品', percentage: 25.4 }, { category: '服饰', percentage: 16.2 }], sampleSize: 31200 },
    { region: 'west', quarter: '2026Q1', vitalityIndex: 58.7, consumptionGrowth: 4.1, topCategories: [{ category: '餐饮', percentage: 30.8 }, { category: '日用品', percentage: 28.2 }, { category: '交通', percentage: 15.5 }], sampleSize: 18900 },
    { region: 'north', quarter: '2026Q1', vitalityIndex: 72.1, consumptionGrowth: 4.5, topCategories: [{ category: '餐饮', percentage: 26.7 }, { category: '服饰', percentage: 21.3 }, { category: '数码产品', percentage: 19.8 }], sampleSize: 27800 },
    { region: 'south', quarter: '2026Q1', vitalityIndex: 81.2, consumptionGrowth: 6.3, topCategories: [{ category: '餐饮', percentage: 25.2 }, { category: '数码产品', percentage: 24.8 }, { category: '服饰', percentage: 20.1 }], sampleSize: 35400 },
  ];

  async getRegionalConsumption(region?: string): Promise<RegionalConsumptionResponse[]> {
    let filtered = this.mockData;
    if (region) {
      filtered = this.mockData.filter(d => d.region === region);
    }
    return filtered;
  }
}
