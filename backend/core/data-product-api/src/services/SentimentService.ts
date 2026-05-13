import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InvestmentSentiment, AssetCategory } from '../entities/InvestmentSentiment.entity';

export interface InvestmentSentimentResponse {
  date: string;
  assetCategory: AssetCategory;
  sentimentScore: number;
  totalSamples: number;
}

@Injectable()
export class SentimentService {
  constructor(
    @InjectRepository(InvestmentSentiment)
    private readonly sentimentRepository: Repository<InvestmentSentiment>,
  ) {}

  async getInvestmentSentiment(): Promise<InvestmentSentimentResponse[]> {
    const categories = [AssetCategory.CASH, AssetCategory.DEPOSIT, AssetCategory.FUND, AssetCategory.STOCK];
    const today = new Date().toISOString().split('T')[0];

    const todayData = await this.sentimentRepository.find({
      where: { date: today, assetCategory: In(categories) },
    });

    const todayMap = new Map<string, InvestmentSentiment>();
    for (const item of todayData) {
      todayMap.set(item.assetCategory, item);
    }

    const missing = categories.filter(c => !todayMap.has(c));

    let fallbackMap = new Map<string, InvestmentSentiment>();
    if (missing.length > 0) {
      const fallbackData = await this.sentimentRepository.find({
        where: { assetCategory: In(missing) },
        order: { date: 'DESC' },
      });
      const seen = new Set<string>();
      for (const item of fallbackData) {
        if (!seen.has(item.assetCategory)) {
          seen.add(item.assetCategory);
          fallbackMap.set(item.assetCategory, item);
        }
      }
    }

    const results: InvestmentSentimentResponse[] = [];
    for (const category of categories) {
      const data = todayMap.get(category) || fallbackMap.get(category);
      if (data) {
        results.push({
          date: data.date,
          assetCategory: data.assetCategory,
          sentimentScore: data.sentimentScore,
          totalSamples: data.totalSamples,
        });
      }
    }

    return results;
  }
}