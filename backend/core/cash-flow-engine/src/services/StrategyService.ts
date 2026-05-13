import { Injectable, Logger } from '@nestjs/common';

export interface PortfolioAllocation {
  CASH: number;
  DEPOSIT: number;
  FUND: number;
  STOCK: number;
  BOND: number;
  GOLD: number;
  FUTURES: number;
  REITS: number;
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

const ALLOCATIONS: Record<string, PortfolioAllocation> = {
  conservative: { CASH: 20, DEPOSIT: 50, FUND: 20, STOCK: 10, BOND: 0, GOLD: 0, FUTURES: 0, REITS: 0 },
  moderate: { CASH: 10, DEPOSIT: 30, FUND: 40, STOCK: 20, BOND: 0, GOLD: 0, FUTURES: 0, REITS: 0 },
  aggressive: { CASH: 5, DEPOSIT: 15, FUND: 30, STOCK: 50, BOND: 0, GOLD: 0, FUTURES: 0, REITS: 0 },
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

  getStrategyByRiskProfile(riskProfile: string): InvestmentStrategy {
    this.logger.log(`Getting strategy for risk profile: ${riskProfile}`);
    const strategies: Record<string, InvestmentStrategy> = {
      conservative: {
        entryTiming: '建议一次性建仓，或分2批每批间隔1周',
        holdingPeriod: '建议持有12-24个月',
        stopProfitLevel: '达到8%收益时分批止盈',
        stopLossLevel: '亏损超过5%时止损',
        riskMgmtAdvice: '单一标的不超过总资产30%',
        capitalMgmtAdvice: '保留40%流动资金',
      },
      moderate: {
        entryTiming: '建议分3批建仓，每批间隔1周',
        holdingPeriod: '建议持有6-12个月',
        stopProfitLevel: '达到15%收益时分批止盈',
        stopLossLevel: '亏损超过8%时止损',
        riskMgmtAdvice: '单一标的不超过总资产20%',
        capitalMgmtAdvice: '保留30%流动资金',
      },
      aggressive: {
        entryTiming: '建议分4批建仓，每批间隔3个交易日',
        holdingPeriod: '建议持有3-6个月',
        stopProfitLevel: '达到25%收益时分批止盈',
        stopLossLevel: '亏损超过12%时止损',
        riskMgmtAdvice: '单一标的不超过总资产15%',
        capitalMgmtAdvice: '保留20%流动资金',
      },
    };
    return strategies[riskProfile] || strategies.conservative;
  }

  getTradingPlan(riskProfile: string, amount: number): string[] {
    this.logger.log(`Getting trading plan for risk profile: ${riskProfile}, amount: ${amount}`);
    const plans: Record<string, string[]> = {
      conservative: [
        `第1批：投入¥${(amount * 0.5).toFixed(2)}购买货币基金或定期存款`,
        `第2批：1周后投入¥${(amount * 0.5).toFixed(2)}购买国债或高评级债券`,
        `留存¥${(amount * 0.4).toFixed(2)}作为流动资金`,
      ],
      moderate: [
        `第1批：投入¥${(amount * 0.4).toFixed(2)}购买混合型基金`,
        `第2批：1周后投入¥${(amount * 0.3).toFixed(2)}购买债券基金`,
        `第3批：2周后投入¥${(amount * 0.3).toFixed(2)}购买指数基金`,
        `留存¥${(amount * 0.3).toFixed(2)}作为流动资金`,
      ],
      aggressive: [
        `第1批：投入¥${(amount * 0.3).toFixed(2)}购买股票型基金`,
        `第2批：3个交易日后投入¥${(amount * 0.3).toFixed(2)}购买成长股`,
        `第3批：6个交易日后投入¥${(amount * 0.2).toFixed(2)}购买行业ETF`,
        `第4批：9个交易日后投入¥${(amount * 0.2).toFixed(2)}购买科技股`,
        `留存¥${(amount * 0.2).toFixed(2)}作为流动资金`,
      ],
    };
    return plans[riskProfile] || plans.conservative;
  }

  getFundamentalAnalysis(productId: string): FundamentalAnalysis {
    this.logger.log(`Getting fundamental analysis for product: ${productId}`);
    const analyses: Record<string, FundamentalAnalysis> = {
      'P-CON-001': { pe: 0, pb: 0, roe: 1.5, revenueGrowth: 3.0 },
      'P-CON-002': { pe: 0, pb: 0, roe: 2.75, revenueGrowth: 2.75 },
      'P-CON-003': { pe: 0, pb: 0, roe: 3.5, revenueGrowth: 4.0 },
      'P-MOD-001': { pe: 15, pb: 2.5, roe: 12.0, revenueGrowth: 15.0 },
      'P-MOD-002': { pe: 8, pb: 1.2, roe: 5.0, revenueGrowth: 4.5 },
      'P-MOD-003': { pe: 12, pb: 2.0, roe: 8.0, revenueGrowth: 10.0 },
      'P-AGG-001': { pe: 25, pb: 4.0, roe: 18.0, revenueGrowth: 25.0 },
      'P-AGG-002': { pe: 20, pb: 3.0, roe: 15.0, revenueGrowth: 20.0 },
      'P-AGG-003': { pe: 30, pb: 5.0, roe: 20.0, revenueGrowth: 35.0 },
    };
    return analyses[productId] || { pe: 10, pb: 1.5, roe: 8.0, revenueGrowth: 10.0 };
  }

  getTechnicalAnalysis(stockCode: string): TechnicalAnalysis {
    this.logger.log(`Getting technical analysis for stock: ${stockCode}`);
    const analyses: Record<string, TechnicalAnalysis> = {
      '600519': { trend: '上升通道中，短期回调概率较大', support: 1600, resistance: 2000, rsi: 62 },
      '000858': { trend: '震荡上行，量能配合良好', support: 120, resistance: 160, rsi: 55 },
      '601318': { trend: '底部整理中，均线走平', support: 45, resistance: 55, rsi: 42 },
      '600036': { trend: '稳步攀升，主力资金持续流入', support: 30, resistance: 38, rsi: 58 },
      '000333': { trend: '高位震荡，注意控制仓位', support: 55, resistance: 65, rsi: 65 },
    };
    return analyses[stockCode] || { trend: '横盘震荡，方向不明朗', support: 0, resistance: 0, rsi: 50 };
  }

  generateRecommendationV2(riskProfile: string): Recommendation & { strategy: InvestmentStrategy; tradingPlan: string[] } {
    const allocation = this.generateRecommendation(riskProfile);
    const strategy = this.getStrategyByRiskProfile(riskProfile);
    const plan = this.getTradingPlan(riskProfile, 100000);
    return { ...allocation, strategy, tradingPlan: plan };
  }
}
