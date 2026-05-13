import { Test, TestingModule } from '@nestjs/testing';
import { StrategyService } from './StrategyService';

describe('StrategyService', () => {
  let service: StrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrategyService],
    }).compile();

    service = module.get<StrategyService>(StrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRiskProfile', () => {
    it('should return conservative for score 5-8', () => {
      expect(service.calculateRiskProfile(5)).toBe('conservative');
      expect(service.calculateRiskProfile(6)).toBe('conservative');
      expect(service.calculateRiskProfile(7)).toBe('conservative');
      expect(service.calculateRiskProfile(8)).toBe('conservative');
    });

    it('should return moderate for score 9-12', () => {
      expect(service.calculateRiskProfile(9)).toBe('moderate');
      expect(service.calculateRiskProfile(10)).toBe('moderate');
      expect(service.calculateRiskProfile(11)).toBe('moderate');
      expect(service.calculateRiskProfile(12)).toBe('moderate');
    });

    it('should return aggressive for score 13-15', () => {
      expect(service.calculateRiskProfile(13)).toBe('aggressive');
      expect(service.calculateRiskProfile(14)).toBe('aggressive');
      expect(service.calculateRiskProfile(15)).toBe('aggressive');
    });

    it('should return conservative for invalid score', () => {
      expect(service.calculateRiskProfile(0)).toBe('conservative');
      expect(service.calculateRiskProfile(20)).toBe('conservative');
    });
  });

  describe('calculateRiskScore', () => {
    it('should calculate score from A/B/C answers and return profile', () => {
      const result = service.calculateRiskScore({ q1: 'A', q2: 'B', q3: 'C', q4: 'A', q5: 'B' });
      expect(result.score).toBe(1 + 2 + 3 + 1 + 2);
      expect(result.riskProfile).toBe('moderate');
    });

    it('should return score 5 for all A answers (conservative)', () => {
      const result = service.calculateRiskScore({ q1: 'A', q2: 'A', q3: 'A', q4: 'A', q5: 'A' });
      expect(result.score).toBe(5);
      expect(result.riskProfile).toBe('conservative');
    });

    it('should return score 15 for all C answers (aggressive)', () => {
      const result = service.calculateRiskScore({ q1: 'C', q2: 'C', q3: 'C', q4: 'C', q5: 'C' });
      expect(result.score).toBe(15);
      expect(result.riskProfile).toBe('aggressive');
    });

    it('should skip unknown answer values', () => {
      const result = service.calculateRiskScore({ q1: 'A', q2: 'D', q3: 'C' });
      expect(result.score).toBe(1 + 3);
    });
  });

  describe('generateRecommendation', () => {
    it('should return conservative allocation for conservative risk profile', () => {
      const result = service.generateRecommendation('conservative');
      expect(result.riskProfile).toBe('conservative');
      expect(result.allocation).toEqual({ CASH: 20, DEPOSIT: 50, FUND: 20, STOCK: 10, BOND: 0, GOLD: 0, FUTURES: 0, REITS: 0 });
      expect(result.riskLevel).toBe(1);
    });

    it('should return moderate allocation for moderate risk profile', () => {
      const result = service.generateRecommendation('moderate');
      expect(result.riskProfile).toBe('moderate');
      expect(result.allocation).toEqual({ CASH: 10, DEPOSIT: 30, FUND: 40, STOCK: 20, BOND: 0, GOLD: 0, FUTURES: 0, REITS: 0 });
      expect(result.riskLevel).toBe(2);
    });

    it('should return aggressive allocation for aggressive risk profile', () => {
      const result = service.generateRecommendation('aggressive');
      expect(result.riskProfile).toBe('aggressive');
      expect(result.allocation).toEqual({ CASH: 5, DEPOSIT: 15, FUND: 30, STOCK: 50, BOND: 0, GOLD: 0, FUTURES: 0, REITS: 0 });
      expect(result.riskLevel).toBe(3);
    });

    it('should default to conservative for unknown risk profile', () => {
      const result = service.generateRecommendation('unknown' as any);
      expect(result.riskProfile).toBe('conservative');
      expect(result.riskLevel).toBe(1);
    });
  });

  describe('getProductsByRiskLevel', () => {
    it('should return 3 products for conservative risk level', () => {
      const products = service.getProductsByRiskLevel('conservative');
      expect(products).toHaveLength(3);
      expect(products.every(p => p.riskLevel === 1)).toBe(true);
    });

    it('should return 3 products for moderate risk level', () => {
      const products = service.getProductsByRiskLevel('moderate');
      expect(products).toHaveLength(3);
      expect(products.every(p => p.riskLevel === 2)).toBe(true);
    });

    it('should return 3 products for aggressive risk level', () => {
      const products = service.getProductsByRiskLevel('aggressive');
      expect(products).toHaveLength(3);
      expect(products.every(p => p.riskLevel === 3)).toBe(true);
    });

    it('should return conservative products for unknown risk level', () => {
      const products = service.getProductsByRiskLevel('unknown' as any);
      expect(products).toHaveLength(3);
      expect(products.every(p => p.riskLevel === 1)).toBe(true);
    });

    it('should include product details', () => {
      const products = service.getProductsByRiskLevel('moderate');
      products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('type');
        expect(product).toHaveProperty('expectedReturn');
        expect(product).toHaveProperty('riskLevel');
        expect(product).toHaveProperty('description');
      });
    });
  });

  describe('getStrategyByRiskProfile', () => {
    it('should return investment strategy for conservative', () => {
      const result = service.getStrategyByRiskProfile('conservative');
      expect(result).toHaveProperty('entryTiming');
      expect(result).toHaveProperty('holdingPeriod');
      expect(result).toHaveProperty('stopProfitLevel');
      expect(result).toHaveProperty('stopLossLevel');
      expect(result).toHaveProperty('riskMgmtAdvice');
      expect(result).toHaveProperty('capitalMgmtAdvice');
      expect(result.holdingPeriod).toContain('12-24');
    });

    it('should return investment strategy for moderate', () => {
      const result = service.getStrategyByRiskProfile('moderate');
      expect(result.holdingPeriod).toContain('6-12');
    });

    it('should return investment strategy for aggressive', () => {
      const result = service.getStrategyByRiskProfile('aggressive');
      expect(result.holdingPeriod).toContain('3-6');
    });

    it('should default to conservative for unknown profile', () => {
      const result = service.getStrategyByRiskProfile('unknown' as any);
      expect(result.holdingPeriod).toContain('12-24');
    });
  });

  describe('getTradingPlan', () => {
    it('should return trading plan for conservative', () => {
      const result = service.getTradingPlan('conservative', 100000);
      expect(result.length).toBe(3);
      expect(result[0]).toContain('第1批');
    });

    it('should return trading plan for aggressive', () => {
      const result = service.getTradingPlan('aggressive', 200000);
      expect(result.length).toBe(5);
    });

    it('should include amount in trading plan steps', () => {
      const result = service.getTradingPlan('moderate', 50000);
      expect(result[0]).toContain('20000');
    });

    it('should default to conservative for unknown profile', () => {
      const result = service.getTradingPlan('unknown' as any, 100000);
      expect(result.length).toBe(3);
    });
  });

  describe('getFundamentalAnalysis', () => {
    it('should return fundamental data for known product', () => {
      const result = service.getFundamentalAnalysis('P-MOD-001');
      expect(result).toHaveProperty('pe');
      expect(result).toHaveProperty('pb');
      expect(result).toHaveProperty('roe');
      expect(result).toHaveProperty('revenueGrowth');
      expect(result.pe).toBe(15);
    });

    it('should return default data for unknown product', () => {
      const result = service.getFundamentalAnalysis('UNKNOWN');
      expect(result.pe).toBe(10);
    });
  });

  describe('getTechnicalAnalysis', () => {
    it('should return technical data for known stock', () => {
      const result = service.getTechnicalAnalysis('600519');
      expect(result).toHaveProperty('trend');
      expect(result).toHaveProperty('support');
      expect(result).toHaveProperty('resistance');
      expect(result).toHaveProperty('rsi');
      expect(result.support).toBe(1600);
    });

    it('should return default data for unknown stock', () => {
      const result = service.getTechnicalAnalysis('UNKNOWN');
      expect(result.rsi).toBe(50);
    });
  });
});
