import { Injectable, Logger } from '@nestjs/common';

export interface PortfolioAllocation {
  CASH: number;
  DEPOSIT: number;
  FUND: number;
  STOCK: number;
}

export interface Recommendation {
  riskProfile: string;
  allocation: PortfolioAllocation;
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

const ALLOCATIONS: Record<string, PortfolioAllocation> = {
  conservative: { CASH: 20, DEPOSIT: 50, FUND: 20, STOCK: 10 },
  moderate: { CASH: 10, DEPOSIT: 30, FUND: 40, STOCK: 20 },
  aggressive: { CASH: 5, DEPOSIT: 15, FUND: 30, STOCK: 50 },
};

const RISK_LEVELS: Record<string, number> = {
  conservative: 1,
  moderate: 2,
  aggressive: 3,
};

const PRODUCTS: Record<string, Product[]> = {
  conservative: [
    {
      id: 'P-CON-001',
      name: '现金管理账户',
      type: 'CASH',
      expectedReturn: 2.0,
      riskLevel: 1,
      description: '灵活性最高的现金管理产品，适合应急备用金',
    },
    {
      id: 'P-CON-002',
      name: '定期存款',
      type: 'DEPOSIT',
      expectedReturn: 2.75,
      riskLevel: 1,
      description: '三年期定期存款，保本保息，利率稳定',
    },
    {
      id: 'P-CON-003',
      name: '货币基金',
      type: 'FUND',
      expectedReturn: 3.5,
      riskLevel: 1,
      description: '低风险基金，流动性好，收益稳健',
    },
  ],
  moderate: [
    {
      id: 'P-MOD-001',
      name: '混合基金',
      type: 'FUND',
      expectedReturn: 6.0,
      riskLevel: 2,
      description: '股债混合型基金，平衡风险与收益',
    },
    {
      id: 'P-MOD-002',
      name: '债券基金',
      type: 'FUND',
      expectedReturn: 4.5,
      riskLevel: 2,
      description: '主要投资于高信用等级债券，风险适中',
    },
    {
      id: 'P-MOD-003',
      name: '养老目标基金',
      type: 'FUND',
      expectedReturn: 5.5,
      riskLevel: 2,
      description: '以养老为目标的投资组合，长期稳健增值',
    },
  ],
  aggressive: [
    {
      id: 'P-AGG-001',
      name: '股票型基金',
      type: 'STOCK',
      expectedReturn: 12.0,
      riskLevel: 3,
      description: '主要投资于股票市场，追求高收益',
    },
    {
      id: 'P-AGG-002',
      name: '指数基金',
      type: 'FUND',
      expectedReturn: 10.0,
      riskLevel: 3,
      description: '跟踪指数表现，被动管理型基金',
    },
    {
      id: 'P-AGG-003',
      name: '成长型股票组合',
      type: 'STOCK',
      expectedReturn: 15.0,
      riskLevel: 3,
      description: '投资于高成长性公司股票',
    },
  ],
};

@Injectable()
export class StrategyService {
  private readonly logger = new Logger(StrategyService.name);

  calculateRiskScore(answers: Record<string, string>): { score: number; riskProfile: string } {
    const scoreMap: Record<string, number> = { A: 1, B: 2, C: 3 };
    let score = 0;
    for (const key of Object.keys(answers)) {
      const answer = answers[key];
      if (scoreMap[answer] !== undefined) {
        score += scoreMap[answer];
      }
    }
    const riskProfile = this.calculateRiskProfile(score);
    this.logger.log(`Calculated score: ${score}, riskProfile: ${riskProfile}`);
    return { score, riskProfile };
  }

  calculateRiskProfile(score: number): string {
    if (score >= 5 && score <= 8) {
      return 'conservative';
    }
    if (score >= 9 && score <= 12) {
      return 'moderate';
    }
    if (score >= 13 && score <= 15) {
      return 'aggressive';
    }
    return 'conservative';
  }

  generateRecommendation(riskProfile: string): Recommendation {
    this.logger.log(`Generating recommendation for risk profile: ${riskProfile}`);
    const validProfiles = ['conservative', 'moderate', 'aggressive'];
    const normalizedProfile = validProfiles.includes(riskProfile) ? riskProfile : 'conservative';
    const allocation = ALLOCATIONS[normalizedProfile] || ALLOCATIONS['conservative'];
    const riskLevel = RISK_LEVELS[normalizedProfile] || 1;
    return {
      riskProfile: normalizedProfile,
      allocation,
      riskLevel,
    };
  }

  getProductsByRiskLevel(riskLevel: string): Product[] {
    this.logger.log(`Getting products for risk level: ${riskLevel}`);
    return PRODUCTS[riskLevel] || PRODUCTS['conservative'];
  }
}
