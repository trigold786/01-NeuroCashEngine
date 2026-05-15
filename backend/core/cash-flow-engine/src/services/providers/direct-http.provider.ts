import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataProvider, StockQuote, FundNAV, KLineData } from './provider.interface';

@Injectable()
export class DirectHttpProvider implements MarketDataProvider {
  private readonly logger = new Logger(DirectHttpProvider.name);
  private readonly timeout = 8000;

  constructor(private readonly http: HttpService) {}

  async getStockQuotes(codes: string[]): Promise<StockQuote[]> {
    const results: StockQuote[] = [];
    for (const code of codes) {
      try {
        const prefix = code.startsWith('6') ? 'sh' : 'sz';
        const url = `https://hq.sinajs.cn/list=${prefix}${code}`;
        const { data } = await firstValueFrom(
          this.http.get(url, {
            headers: { Referer: 'https://finance.sina.com.cn' },
            timeout: this.timeout,
            responseType: 'text',
          })
        );
        const match = data.match(/"(.+)"/);
        if (match) {
          const parts = match[1].split(',');
          results.push({
            code,
            name: parts[0] || '',
            price: parseFloat(parts[3]) || 0,
            changePercent: parseFloat(parts[4]) || parseFloat(parts[3]) - parseFloat(parts[2]) || 0,
            changeAmount: parseFloat(parts[3]) - parseFloat(parts[2]) || 0,
            high: parseFloat(parts[5]) || 0,
            low: parseFloat(parts[6]) || 0,
            open: parseFloat(parts[1]) || 0,
            prevClose: parseFloat(parts[2]) || 0,
            volume: parseFloat(parts[9]) || 0,
            turnover: parseFloat(parts[10]) || 0,
            timestamp: new Date(),
          });
        }
      } catch (err) {
        this.logger.warn(`Fallback getStockQuotes failed for ${code}: ${(err as Error).message}`);
      }
    }
    return results;
  }

  async getFundNAVs(_codes: string[]): Promise<FundNAV[]> {
    this.logger.warn('Fallback getFundNAVs not implemented — requires AKTools');
    return [];
  }

  async getKLine(_code: string, _period: string = 'daily', _days: number = 90): Promise<KLineData[]> {
    this.logger.warn('Fallback getKLine not implemented — requires AKTools');
    return [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getStockQuotes(['000001']);
      return true;
    } catch {
      return false;
    }
  }
}
