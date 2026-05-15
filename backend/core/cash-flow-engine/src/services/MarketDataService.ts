import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AktoolsProvider } from './providers/aktools.provider';
import { DirectHttpProvider } from './providers/direct-http.provider';
import { MarketDataProvider, StockQuote, FundNAV, KLineData } from './providers/provider.interface';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly primary: AktoolsProvider;
  private readonly fallback: DirectHttpProvider;
  private primaryHealthy = true;

  constructor(http: HttpService) {
    this.primary = new AktoolsProvider(http);
    this.fallback = new DirectHttpProvider(http);
  }

  private getProvider(): MarketDataProvider {
    return this.primaryHealthy ? this.primary : this.fallback;
  }

  async switchProvider(): Promise<void> {
    const healthy = await this.primary.healthCheck();
    if (healthy !== this.primaryHealthy) {
      this.primaryHealthy = healthy;
      this.logger.log(`AKTools provider ${healthy ? 'restored' : 'unavailable, switching to fallback'}`);
    }
  }

  async getStockQuotes(codes: string[]): Promise<StockQuote[]> {
    try {
      return await this.getProvider().getStockQuotes(codes);
    } catch (err) {
      this.logger.warn(`Primary failed, trying fallback: ${(err as Error).message}`);
      this.primaryHealthy = false;
      const fallbackResult = await this.fallback.getStockQuotes(codes);
      if (fallbackResult.length === 0) throw err;
      return fallbackResult;
    }
  }

  async getFundNAVs(codes: string[]): Promise<FundNAV[]> {
    try {
      return await this.getProvider().getFundNAVs(codes);
    } catch (err) {
      this.logger.warn(`Primary failed for fund NAVs: ${(err as Error).message}`);
      this.primaryHealthy = false;
      return this.fallback.getFundNAVs(codes);
    }
  }

  async getKLine(code: string, period: string = 'daily', days: number = 90): Promise<KLineData[]> {
    try {
      return await this.getProvider().getKLine(code, period, days);
    } catch (err) {
      this.logger.warn(`Primary failed for KLine: ${(err as Error).message}`);
      this.primaryHealthy = false;
      return this.fallback.getKLine(code, period, days);
    }
  }
}
