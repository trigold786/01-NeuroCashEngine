import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataProvider, StockQuote, FundNAV, KLineData, MarketDataError } from './provider.interface';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

@Injectable()
export class AktoolsProvider implements MarketDataProvider {
  private readonly logger = new Logger(AktoolsProvider.name);
  private readonly timeout = 15000;

  constructor(private readonly http: HttpService) {}

  async getStockQuotes(codes: string[]): Promise<StockQuote[]> {
    try {
      const secids = codes.map(c => (c.startsWith('6') ? '1.' : '0.') + c).join(',');
      const params = { fltt: '2', invt: '2', fields: 'f2,f3,f4,f12,f14', secids };
      const { data } = await firstValueFrom(
        this.http.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
          params, headers: { 'User-Agent': UA }, timeout: this.timeout,
        })
      );
      const items: any[] = data?.data?.diff || [];
      return items.map((s: any) => ({
        code: String(s['f12']),
        name: String(s['f14'] || ''),
        price: Number(s['f2'] ?? 0),
        changePercent: Number(s['f3'] ?? 0),
        changeAmount: Number(s['f4'] ?? 0),
        high: 0, low: 0, open: 0, prevClose: 0,
        volume: 0, turnover: 0,
        timestamp: new Date(),
      }));
    } catch (err) {
      throw new MarketDataError((err as Error).message, 'EastMoney');
    }
  }

  async getFundNAVs(codes: string[]): Promise<FundNAV[]> {
    const results: FundNAV[] = [];
    for (const code of codes) {
      try {
        const { data } = await firstValueFrom(
          this.http.get(`http://fundgz.1234567.com.cn/js/${code}.js`, {
            headers: { 'User-Agent': UA, Referer: 'http://fund.eastmoney.com' },
            timeout: this.timeout,
            responseType: 'text',
          })
        );
        const match = (data as string).match(/jsonpgz\((.+)\)/);
        if (match) {
          const item = JSON.parse(match[1]);
          results.push({
            code: String(item.fundcode),
            name: String(item.name || ''),
            nav: Number(item.dwjz ?? 0),
            accNav: 0,
            navDate: String(item.jzrq || ''),
            dayChangePercent: Number(item.gszzl ?? 0),
          });
        }
      } catch (err) {
        this.logger.warn(`Fund NAV fetch failed for ${code}: ${(err as Error).message}`);
      }
    }
    return results;
  }

  async getKLine(code: string, period: string = 'daily', days: number = 90): Promise<KLineData[]> {
    try {
      const prefix = code.startsWith('6') ? '1' : '0';
      const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
      const params = {
        secid: `${prefix}.${code}`, fields1: 'f1,f2,f3',
        fields2: 'f51,f52,f53,f54,f55,f56,f57',
        klt: period === 'weekly' ? 102 : 101,
        fqt: 1, end: '20500101', lmt: days,
      };
      const { data } = await firstValueFrom(
        this.http.get(url, { params, headers: { 'User-Agent': UA }, timeout: this.timeout })
      );
      const klines: string[] = data?.data?.klines || [];
      return klines.map((k: string) => {
        const parts = k.split(',');
        return {
          date: parts[0] || '',
          open: parseFloat(parts[1]) || 0,
          close: parseFloat(parts[2]) || 0,
          high: parseFloat(parts[3]) || 0,
          low: parseFloat(parts[4]) || 0,
          volume: parseFloat(parts[5]) || 0,
          amount: parseFloat(parts[6]) || 0,
        };
      });
    } catch (err) {
      throw new MarketDataError((err as Error).message, 'EastMoney');
    }
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
