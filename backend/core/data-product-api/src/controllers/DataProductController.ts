import { Controller, Get, Query } from '@nestjs/common';
import { DataProductService } from '../services/DataProductService';
import { AssetCategory } from '../entities/InvestmentSentiment.entity';

@Controller('api')
export class DataProductController {
  constructor(private readonly dataProductService: DataProductService) {}

  // C端投资情绪指数API
  @Get('investment-sentiment')
  async getInvestmentSentiment(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: AssetCategory,
  ): Promise<any> {
    return await this.dataProductService.getInvestmentSentiment(startDate, endDate, category);
  }

  // 获取最新情绪概览
  @Get('investment-sentiment/latest')
  async getLatestSentimentOverview(): Promise<any> {
    return await this.dataProductService.getLatestSentimentOverview();
  }

  // 健康检查
  @Get('health')
  async getHealth(): Promise<any> {
    return {
      success: true,
      service: 'data-product-api',
      timestamp: new Date().toISOString(),
    };
  }
}
