import { cashflowApiClient } from './client';

export interface Recommendation {
  riskProfile: string;
  allocation: { CASH: number; DEPOSIT: number; FUND: number; STOCK: number; BOND: number; GOLD: number; FUTURES: number; REITS: number };
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

export interface InvestmentStrategy {
  entryTiming: string;
  holdingPeriod: string;
  stopProfitLevel: string;
  stopLossLevel: string;
  riskMgmtAdvice: string;
  capitalMgmtAdvice: string;
}

export interface FundamentalAnalysis {
  pe: number;
  pb: number;
  roe: number;
  revenueGrowth: number;
}

export interface TechnicalAnalysis {
  trend: string;
  support: number;
  resistance: number;
  rsi: number;
}

export interface EnterpriseQuestionnaire {
  revenueScale: 'A' | 'B' | 'C';
  debtRatio: 'A' | 'B' | 'C';
  cashCycleDays: 'A' | 'B' | 'C';
  yearsInBusiness: 'A' | 'B' | 'C';
  industryRisk: 'A' | 'B' | 'C';
  emergencyFund: 'A' | 'B' | 'C';
  investmentExperience: 'A' | 'B' | 'C';
  employeeCount: 'A' | 'B' | 'C';
  receivableRatio: 'A' | 'B' | 'C';
  taxCompliance: 'A' | 'B' | 'C';
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

  async getStrategy(riskProfile: string): Promise<InvestmentStrategy> {
    return await cashflowApiClient.get('/strategy/strategy', { params: { riskProfile } });
  },

  async getTradingPlan(riskProfile: string, amount: number): Promise<string[]> {
    return await cashflowApiClient.post('/strategy/trading-plan', { riskProfile, amount });
  },

  async getFundamentalAnalysis(productId: string): Promise<FundamentalAnalysis> {
    return await cashflowApiClient.get('/strategy/analysis/fundamental', { params: { productId } });
  },

  async getTechnicalAnalysis(stockCode: string): Promise<TechnicalAnalysis> {
    return await cashflowApiClient.get('/strategy/analysis/technical', { params: { stockCode } });
  },

  async getNSIProfile(userId: string): Promise<any> {
    return await cashflowApiClient.get('/nsi/profile', { params: { userId } });
  },

  async getEnhancedRisk(userId: string, baseRiskProfile: string): Promise<any> {
    return await cashflowApiClient.get('/nsi/enhanced-risk', { params: { userId, baseRiskProfile } });
  },

  async getFinancialHealth(userId: string): Promise<any> {
    return await cashflowApiClient.get('/nsi/financial-health', { params: { userId } });
  },
};
