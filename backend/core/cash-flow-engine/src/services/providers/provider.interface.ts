export interface StockQuote {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume: number;
  turnover: number;
  timestamp: Date;
}

export interface FundNAV {
  code: string;
  name: string;
  nav: number;
  accNav: number;
  navDate: string;
  dayChangePercent: number;
}

export interface IndexQuote {
  code: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface KLineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
}

export interface MarketDataProvider {
  getStockQuotes(codes: string[]): Promise<StockQuote[]>;
  getFundNAVs(codes: string[]): Promise<FundNAV[]>;
  getKLine(code: string, period: string, days: number): Promise<KLineData[]>;
}

export class MarketDataError extends Error {
  constructor(message: string, public readonly source: string) {
    super(`[${source}] ${message}`);
  }
}
