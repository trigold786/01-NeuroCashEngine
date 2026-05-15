import { cashflowApiClient } from './client';

export interface StockQuote {
  code: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface FundNAV {
  code: string;
  name: string;
  nav: number;
  navDate: string;
}

export interface KLinePoint {
  date: string;
  close: number;
  high: number;
  low: number;
}

export const getStockQuotes = async (codes: string[]): Promise<StockQuote[]> => {
  if (codes.length === 0) return [];
  const res = await cashflowApiClient.get('/market/stocks', { params: { codes: codes.join(',') } });
  return res.data?.data || [];
};

export const getFundNAVs = async (codes: string[]): Promise<FundNAV[]> => {
  if (codes.length === 0) return [];
  const res = await cashflowApiClient.get('/market/funds', { params: { codes: codes.join(',') } });
  return res.data?.data || [];
};

export const getKLine = async (code: string, period = 'daily', days = 90): Promise<KLinePoint[]> => {
  const res = await cashflowApiClient.get('/market/kline', { params: { code, period, days } });
  return res.data?.data || [];
};
