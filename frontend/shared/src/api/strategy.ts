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

export interface EnterpriseQuestionnaire {
  revenueScale: 'A' | 'B' | 'C';
  debtRatio: 'A' | 'B' | 'C';
  cashCycleDays: 'A' | 'B' | 'C';
  yearsInBusiness: 'A' | 'B' | 'C';
  industryRisk: 'A' | 'B' | 'C';
  emergencyFund: 'A' | 'B' | 'C';
  investmentExperience: 'A' | 'B' | 'C';
}

export interface EnterpriseRiskProfile {
  score: number;
  profile: 'conservative' | 'stable' | 'aggressive';
}

export interface EnterpriseProduct {
  id: string;
  name: string;
  expectedReturn: number;
  riskLevel: number;
  liquidityDays: number;
  description: string;
}

export interface EnterprisePortfolioMetrics {
  expectedReturn: number;
  riskLevel: number;
  liquidityScore: number;
  allocation: { CASH: number; DEPOSIT: number; FUND: number; STOCK: number };
}

export interface EnterpriseStrategyTemplate {
  id: string;
  name: string;
  description: string;
  allocation: { CASH: number; DEPOSIT: number; FUND: number; STOCK: number };
  suitableFor: string;
  executionGuide: string;
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

  async enterpriseAssessRisk(answers: EnterpriseQuestionnaire): Promise<EnterpriseRiskProfile> {
    return await cashflowApiClient.post('/enterprise/strategy/assess', answers);
  },

  async enterpriseGetProducts(riskProfile: string, liquidityDays?: number): Promise<EnterpriseProduct[]> {
    const params: any = { riskProfile };
    if (liquidityDays !== undefined) params.liquidityDays = liquidityDays;
    return await cashflowApiClient.get('/enterprise/strategy/products', { params });
  },

  async enterpriseGetPortfolio(riskProfile: string): Promise<EnterprisePortfolioMetrics> {
    return await cashflowApiClient.get('/enterprise/strategy/portfolio', { params: { riskProfile } });
  },

  async enterpriseGetTemplates(): Promise<EnterpriseStrategyTemplate[]> {
    return await cashflowApiClient.get('/enterprise/strategy/templates');
  },
};
