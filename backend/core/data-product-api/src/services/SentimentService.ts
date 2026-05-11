import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const results: InvestmentSentimentResponse[] = [];

    for (const category of categories) {
      const latestData = await this.sentimentRepository.findOne({
        where: { date: today, assetCategory: category },
        order: { updatedAt: 'DESC' },
      });

      if (latestData) {
        results.push({
          date: latestData.date,
          assetCategory: latestData.assetCategory,
          sentimentScore: latestData.sentimentScore,
          totalSamples: latestData.totalSamples,
        });
      } else {
        const anyData = await this.sentimentRepository.findOne({
          where: { assetCategory: category },
          order: { date: 'DESC' },
        });
        if (anyData) {
          results.push({
            date: anyData.date,
            assetCategory: anyData.assetCategory,
            sentimentScore: anyData.sentimentScore,
            totalSamples: anyData.totalSamples,
          });
        }
      }
    }

    return results;
  }
}