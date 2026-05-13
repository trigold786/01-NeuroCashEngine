import { cashflowApiClient } from './client';

export interface Recommendation {
  riskProfile: string;
  allocation: { CASH: number; DEPOSIT: number; FUND: number; STOCK: number };
  riskLevel: number;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  expectedReturn: number;
  riskLevel: number;
  description: string;
}

export const strategyApi = {
  async calculateRiskScore(answers: Record<string, string>): Promise<{ riskProfile: string; score: number }> {
    return await cashflowApiClient.post('/strategy/risk-score', answers);
  },

  async getRecommendation(riskProfile: string): Promise<Recommendation> {
    return await cashflowApiClient.post('/strategy/recommend', { riskProfile });
  },

  async getProductsByRiskLevel(riskLevel: string): Promise<Product[]> {
    return await cashflowApiClient.get('/strategy/products', { params: { riskLevel } });
  },
};
