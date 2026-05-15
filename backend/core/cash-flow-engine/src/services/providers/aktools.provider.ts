import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataProvider, StockQuote, FundNAV, KLineData, MarketDataError } from './provider.interface';

const AKTOOLS_URL = process.env.AKTOOLS_URL || 'http://nce-aktools:8080';

@Injectable()
export class AktoolsProvider implements MarketDataProvider {
  private readonly logger = new Logger(AktoolsProvider.name);
  private readonly timeout = 10000;

  constructor(private readonly http: HttpService) {}

  async getStockQuotes(codes: string[]): Promise<StockQuote[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${AKTOOLS_URL}/api/public/stock_zh_a_spot_em`, { timeout: this.timeout })
      );
      const allStocks: any[] = Array.isArray(data) ? data : (data?.data || []);
      const codeSet = new Set(codes);
      return allStocks
        .filter((s: any) => codeSet.has(String(s['代码'])))
        .map((s: any) => ({
          code: String(s['代码']),
          name: String(s['名称'] || ''),
          price: Number(s['最新价'] || 0),
          changePercent: Number(s['涨跌幅'] || 0),
          changeAmount: Number(s['涨跌额'] || 0),
          high: Number(s['最高'] || 0),
          low: Number(s['最低'] || 0),
          open: Number(s['今开'] || 0),
          prevClose: Number(s['昨收'] || 0),
          volume: Number(s['成交量'] || 0),
          turnover: Number(s['成交额'] || 0),
          timestamp: new Date(),
        }));
    } catch (err) {
      throw new MarketDataError((err as Error).message, 'AKTools');
    }
  }

  async getFundNAVs(codes: string[]): Promise<FundNAV[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${AKTOOLS_URL}/api/public/fund_open_fund_daily_em`, { timeout: this.timeout })
      );
      const allFunds: any[] = Array.isArray(data) ? data : (data?.data || []);
      const codeSet = new Set(codes);
      return allFunds
        .filter((f: any) => codeSet.has(String(f['基金代码'])))
        .map((f: any) => ({
          code: String(f['基金代码']),
          name: String(f['基金简称'] || ''),
          nav: Number(f['单位净值'] || 0),
          accNav: Number(f['累计净值'] || 0),
          navDate: String(f['净值日期'] || ''),
          dayChangePercent: Number(f['日增长率'] || 0),
        }));
    } catch (err) {
      throw new MarketDataError((err as Error).message, 'AKTools');
    }
  }

  async getKLine(code: string, period: string = 'daily', days: number = 90): Promise<KLineData[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${AKTOOLS_URL}/api/public/stock_zh_a_hist`, {
          params: { symbol: code, period },
          timeout: this.timeout,
        })
      );
      const rows: any[] = Array.isArray(data) ? data : (data?.data || []);
      return rows.slice(-days).map((r: any) => ({
        date: String(r['日期'] || ''),
        open: Number(r['开盘'] || 0),
        close: Number(r['收盘'] || 0),
        high: Number(r['最高'] || 0),
        low: Number(r['最低'] || 0),
        volume: Number(r['成交量'] || 0),
        amount: Number(r['成交额'] || 0),
      }));
    } catch (err) {
      throw new MarketDataError((err as Error).message, 'AKTools');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.get(`${AKTOOLS_URL}/api/public/stock_zh_a_spot_em`, { timeout: 5000 }));
      return true;
    } catch {
      return false;
    }
  }
}
