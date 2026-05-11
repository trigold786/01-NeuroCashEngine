import { cashflowApiClient } from './client';
import { CashFlowForecast, GeneratedSop, IndustryClassification, SopType, CashFlowEvent, EventType } from '../types';

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

  async getEvents(): Promise<CashFlowEvent[]> {
    return await cashflowApiClient.get('/business/cashflow/events');
  },

  async createEvent(params: { eventType: EventType; eventDate: string; amount: number; description?: string }): Promise<CashFlowEvent> {
    return await cashflowApiClient.post('/business/cashflow/events', params);
  },

  async seedEvents(): Promise<void> {
    return await cashflowApiClient.post('/business/cashflow/events/seed');
  },

  async exportPdf(sopId: string): Promise<Blob> {
    const url = `${(import.meta as any).env?.VITE_CASHFLOW_API_URL || 'http://localhost:3005'}/business/cashflow/sop/${sopId}/export/pdf`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('nce_access_token') || ''}`,
      },
    });
    return response.blob();
  },

  async exportMarkdown(sopId: string): Promise<string> {
    return await cashflowApiClient.get(`/business/cashflow/sop/${sopId}/export/markdown`);
  },
};
