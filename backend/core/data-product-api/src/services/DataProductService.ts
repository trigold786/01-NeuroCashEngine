import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestmentSentiment, AssetCategory } from '../entities/InvestmentSentiment.entity';

@Injectable()
export class DataProductService {
  constructor(
    @InjectRepository(InvestmentSentiment)
    private readonly sentimentRepository: Repository<InvestmentSentiment>,
  ) {}

  // 初始化Demo数据
  async seedDemoData(): Promise<void> {
    const count = await this.sentimentRepository.count();
    if (count > 0) return;

    const categories = Object.values(AssetCategory);
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (const category of categories) {
        const score = 30 + Math.random() * 60;
        const sentiment = this.sentimentRepository.create({
          date: dateStr,
          assetCategory: category,
          sentimentScore: parseFloat(score.toFixed(2)),
          totalSamples: Math.floor(1000 + Math.random() * 9000),
          metadata: JSON.stringify({
            generated: true,
            demo: true
          }),
        });
        await this.sentimentRepository.save(sentiment);
      }
    }
  }

  // 获取C端投资情绪指数（支持日期范围、分类筛选）
  async getInvestmentSentiment(
    startDate?: string,
    endDate?: string,
    assetCategory?: AssetCategory,
  ): Promise<any> {
    const queryBuilder = this.sentimentRepository.createQueryBuilder('sentiment');

    if (startDate) {
      queryBuilder.andWhere('sentiment.date >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('sentiment.date <= :endDate', { endDate });
    }
    if (assetCategory) {
      queryBuilder.andWhere('sentiment.assetCategory = :category', { category: assetCategory });
    }

    const data = await queryBuilder
      .orderBy('sentiment.date', 'DESC')
      .getMany();

    return {
      success: true,
      data: data.map(item => ({
        // 确保数据脱敏，不包含个人信息
        date: item.date,
        assetCategory: item.assetCategory,
        sentimentScore: item.sentimentScore,
        totalSamples: item.totalSamples,
      })),
    };
  }

  // 获取最新的情绪指数概览
  async getLatestSentimentOverview(): Promise<any> {
    const queryBuilder = this.sentimentRepository.createQueryBuilder('sentiment');
    
    const latestDate = await queryBuilder
      .select('MAX(sentiment.date)', 'maxDate')
      .getRawOne();
    
    if (!latestDate?.maxDate) {
      return { success: true, data: [] };
    }

    const latestData = await this.sentimentRepository.find({
      where: { date: latestDate.maxDate },
    });

    return {
      success: true,
      data: latestData.map(item => ({
        date: item.date,
        assetCategory: item.assetCategory,
        sentimentScore: item.sentimentScore,
        totalSamples: item.totalSamples,
      })),
    };
  }
}
