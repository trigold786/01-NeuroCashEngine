import { cashflowApiClient } from './client';
import { CashFlowForecast, GeneratedSop, IndustryClassification, SopType } from '../types';

export interface GenerateForecastParams {
  forecastDays?: number;
  startDate?: string;
}

export interface GenerateSopParams {
  forecastId?: string;
  type?: SopType;
  title?: string;
}

export const businessApi = {
  async generateForecast(params: GenerateForecastParams): Promise<CashFlowForecast[]> {
    return await cashflowApiClient.post('/business/cashflow/forecast', params);
  },

  async getForecast(): Promise<CashFlowForecast[]> {
    return await cashflowApiClient.get('/business/cashflow/forecast');
  },

  async generateSop(params: GenerateSopParams): Promise<GeneratedSop> {
    return await cashflowApiClient.post('/business/cashflow/sop', params);
  },

  async getSops(): Promise<GeneratedSop[]> {
    return await cashflowApiClient.get('/business/cashflow/sop');
  },

  async getSopById(id: string): Promise<GeneratedSop> {
    return await cashflowApiClient.get(`/business/cashflow/sop/${id}`);
  },

  async deleteSop(id: string): Promise<void> {
    return await cashflowApiClient.delete(`/business/cashflow/sop/${id}`);
  },

  async getIndustries(): Promise<IndustryClassification[]> {
    return await cashflowApiClient.get('/business/cashflow/industries');
  },
};
