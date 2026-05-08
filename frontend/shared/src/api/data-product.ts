import axios from 'axios';
import { InvestmentSentiment, AssetCategory, DataProductResponse } from '../types';

const dataProductApiClient = axios.create({
  baseURL: (import.meta as any).env.VITE_DATA_PRODUCT_API_URL || 'http://localhost:3007',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface GetInvestmentSentimentParams {
  startDate?: string;
  endDate?: string;
  category?: AssetCategory;
}

export const dataProductApi = {
  async getInvestmentSentiment(
    params?: GetInvestmentSentimentParams,
  ): Promise<DataProductResponse<InvestmentSentiment[]>> {
    return await dataProductApiClient.get('/api/investment-sentiment', { params });
  },

  async getLatestSentimentOverview(): Promise<DataProductResponse<InvestmentSentiment[]>> {
    return await dataProductApiClient.get('/api/investment-sentiment/latest');
  },

  async getHealth(): Promise<DataProductResponse<any>> {
    return await dataProductApiClient.get('/api/health');
  },
};
