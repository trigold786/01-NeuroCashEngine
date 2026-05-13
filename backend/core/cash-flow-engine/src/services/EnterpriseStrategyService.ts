import { Injectable, Logger } from '@nestjs/common';

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
  allocation: {
    CASH: number;
    DEPOSIT: number;
    FUND: number;
    STOCK: number;
  };
}

export interface EnterpriseStrategyTemplate {
  id: string;
  name: string;
  description: string;
  allocation: {
    CASH: number;
    DEPOSIT: number;
    FUND: number;
    STOCK: number;
  };
  suitableFor: string;
  executionGuide: string;
}

const PRODUCTS_BY_PROFILE: Record<string, EnterpriseProduct[]> = {
  conservative: [
    { id: 'E-CON-001', name: '短期存款', expectedReturn: 2.0, riskLevel: 1, liquidityDays: 1, description: '银行短期存款，保本保息，流动性极佳' },
    { id: 'E-CON-002', name: '货币基金', expectedReturn: 2.5, riskLevel: 1, liquidityDays: 1, description: '低风险货币市场基金，T+0赎回' },
    { id: 'E-CON-003', name: '国债逆回购', expectedReturn: 2.8, riskLevel: 1, liquidityDays: 1, description: '以国债为抵押的短期融资工具' },
  ],
  stable: [
    { id: 'E-STA-001', name: '结构性存款', expectedReturn: 3.5, riskLevel: 2, liquidityDays: 30, description: '保本浮动收益结构性产品' },
    { id: 'E-STA-002', name: '短债基金', expectedReturn: 4.0, riskLevel: 2, liquidityDays: 2, description: '投资短期债券的基金产品' },
    { id: 'E-STA-003', name: '混合基金', expectedReturn: 5.5, riskLevel: 2, liquidityDays: 3, description: '股债平衡配置的混合型基金' },
  ],
  aggressive: [
    { id: 'E-AGG-001', name: '指数基金', expectedReturn: 8.0, riskLevel: 3, liquidityDays: 2, description: '跟踪市场指数的被动型基金' },
    { id: 'E-AGG-002', name: '股票基金', expectedReturn: 10.0, riskLevel: 3, liquidityDays: 3, description: '主要投资于股票市场的基金' },
    { id: 'E-AGG-003', name: '私募债', expectedReturn: 7.0, riskLevel: 3, liquidityDays: 90, description: '非公开发行的企业债券' },
  ],
};

const PORTFOLIO_METRICS: Record<string, EnterprisePortfolioMetrics> = {
  conservative: {
    expectedReturn: 2.5,
    riskLevel: 1,
    liquidityScore: 95,
    allocation: { CASH: 30, DEPOSIT: 40, FUND: 25, STOCK: 5 },
  },
  stable: {
    expectedReturn: 4.5,
    riskLevel: 2,
    liquidityScore: 75,
    allocation: { CASH: 15, DEPOSIT: 30, FUND: 40, STOCK: 15 },
  },
  aggressive: {
    expectedReturn: 8.5,
    riskLevel: 3,
    liquidityScore: 50,
    allocation: { CASH: 5, DEPOSIT: 15, FUND: 35, STOCK: 45 },
  },
};

const STRATEGY_TEMPLATES: EnterpriseStrategyTemplate[] = [
  {
    id: 'T-CON-001',
    name: '保守型策略',
    description: '保本优先，流动性为王',
    allocation: { CASH: 30, DEPOSIT: 40, FUND: 25, STOCK: 5 },
    suitableFor: '现金流紧张、资金安全要求高的企业',
    executionGuide: '优先配置短期存款和货币基金，确保日常运营资金流动性。建议保留3-6个月运营现金。',
  },
  {
    id: 'T-STA-001',
    name: '稳健型策略',
    description: '稳健增值，风险可控',
    allocation: { CASH: 15, DEPOSIT: 30, FUND: 40, STOCK: 15 },
    suitableFor: '现金流稳定、有一定风险承受能力的企业',
    executionGuide: '以结构性存款和短债基金为核心配置，适度配置混合基金增强收益。定期再平衡。',
  },
  {
    id: 'T-AGG-001',
    name: '进取型策略',
    description: '收益最大化，承担较高风险',
    allocation: { CASH: 5, DEPOSIT: 15, FUND: 35, STOCK: 45 },
    suitableFor: '现金流充裕、追求高收益的企业',
    executionGuide: '以股票基金和指数基金为主力配置，辅以私募债增强收益弹性。需密切监控市场波动。',
  },
];

@Injectable()
export class EnterpriseStrategyService {
  private readonly logger = new Logger(EnterpriseStrategyService.name);

  assessRiskProfile(answers: EnterpriseQuestionnaire): EnterpriseRiskProfile {
    const scoreMap: Record<string, number> = { A: 1, B: 2, C: 3 };
    let score = 0;

    for (const key of Object.keys(answers) as (keyof EnterpriseQuestionnaire)[]) {
      const answer = answers[key];
      if (scoreMap[answer] !== undefined) {
        score += scoreMap[answer];
      }
    }

    let profile: 'conservative' | 'stable' | 'aggressive';
    if (score >= 7 && score <= 11) {
      profile = 'conservative';
    } else if (score >= 12 && score <= 16) {
      profile = 'stable';
    } else {
      profile = 'aggressive';
    }

    this.logger.log(`Enterprise risk assessment: score=${score}, profile=${profile}`);
    return { score, profile };
  }

  getProductsByProfile(riskProfile: string, liquidityDays?: number): EnterpriseProduct[] {
    const profile = ['conservative', 'stable', 'aggressive'].includes(riskProfile) ? riskProfile : 'conservative';
    let products = PRODUCTS_BY_PROFILE[profile] || PRODUCTS_BY_PROFILE.conservative;

    if (liquidityDays !== undefined && liquidityDays > 0) {
      products = products.filter(p => p.liquidityDays <= liquidityDays);
    }

    this.logger.log(`Products for ${profile}: ${products.length} found`);
    return products;
  }

  getPortfolioMetrics(riskProfile: string): EnterprisePortfolioMetrics {
    const profile = ['conservative', 'stable', 'aggressive'].includes(riskProfile) ? riskProfile : 'conservative';
    return PORTFOLIO_METRICS[profile];
  }

  getStrategyTemplates(): EnterpriseStrategyTemplate[] {
    return STRATEGY_TEMPLATES;
  }
}
