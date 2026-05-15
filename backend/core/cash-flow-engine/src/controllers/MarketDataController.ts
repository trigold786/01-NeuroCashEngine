import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketDataService } from '../services/MarketDataService';

@Controller('market')
@UseGuards(JwtAuthGuard)
export class MarketDataController {
  private readonly logger = new Logger(MarketDataController.name);

  constructor(private readonly marketData: MarketDataService) {}

  @Get('stocks')
  async getStockQuotes(@Query('codes') codes: string) {
    const codeList = codes.split(',').map(c => c.trim()).filter(Boolean);
    if (codeList.length === 0) return { data: [] };
    const quotes = await this.marketData.getStockQuotes(codeList);
    return { data: quotes };
  }

  @Get('funds')
  async getFundNAVs(@Query('codes') codes: string) {
    const codeList = codes.split(',').map(c => c.trim()).filter(Boolean);
    if (codeList.length === 0) return { data: [] };
    return { data: await this.marketData.getFundNAVs(codeList) };
  }

  @Get('kline')
  async getKLine(
    @Query('code') code: string,
    @Query('period') period: string = 'daily',
    @Query('days') days: string = '90',
  ) {
    if (!code) return { data: [] };
    return { data: await this.marketData.getKLine(code, period, parseInt(days, 10)) };
  }

  @Get('health')
  async healthCheck() {
    return { status: 'ok', service: 'MarketData', timestamp: new Date().toISOString() };
  }
}
