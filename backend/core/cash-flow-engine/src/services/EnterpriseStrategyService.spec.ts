import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseStrategyService } from './EnterpriseStrategyService';

describe('EnterpriseStrategyService', () => {
  let service: EnterpriseStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnterpriseStrategyService],
    }).compile();

    service = module.get<EnterpriseStrategyService>(EnterpriseStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assessRiskProfile', () => {
    it('should return conservative for score 7-11 (all A answers)', () => {
      const result = service.assessRiskProfile({
        revenueScale: 'A',
        debtRatio: 'A',
        cashCycleDays: 'A',
        yearsInBusiness: 'A',
        industryRisk: 'A',
        emergencyFund: 'A',
        investmentExperience: 'A',
      });
      expect(result.score).toBe(7);
      expect(result.profile).toBe('conservative');
    });

    it('should return stable for mixed answers scoring 12', () => {
      const result = service.assessRiskProfile({
        revenueScale: 'C',
        debtRatio: 'B',
        cashCycleDays: 'A',
        yearsInBusiness: 'B',
        industryRisk: 'A',
        emergencyFund: 'A',
        investmentExperience: 'B',
      });
      expect(result.score).toBe(3 + 2 + 1 + 2 + 1 + 1 + 2);
      expect(result.score).toBe(12);
      expect(result.profile).toBe('stable');
    });

    it('should return stable for score 12-16', () => {
      const result = service.assessRiskProfile({
        revenueScale: 'B',
        debtRatio: 'B',
        cashCycleDays: 'B',
        yearsInBusiness: 'B',
        industryRisk: 'B',
        emergencyFund: 'B',
        investmentExperience: 'B',
      });
      expect(result.score).toBe(14);
      expect(result.profile).toBe('stable');
    });

    it('should return conservative for score boundary 10', () => {
      const result = service.assessRiskProfile({
        revenueScale: 'B',
        debtRatio: 'A',
        cashCycleDays: 'A',
        yearsInBusiness: 'B',
        industryRisk: 'A',
        emergencyFund: 'A',
        investmentExperience: 'B',
      });
      expect(result.score).toBe(2 + 1 + 1 + 2 + 1 + 1 + 2);
      expect(result.score).toBe(10);
      expect(result.profile).toBe('conservative');
    });

    it('should return aggressive for score 17-21 (all C answers)', () => {
      const result = service.assessRiskProfile({
        revenueScale: 'C',
        debtRatio: 'C',
        cashCycleDays: 'C',
        yearsInBusiness: 'C',
        industryRisk: 'C',
        emergencyFund: 'C',
        investmentExperience: 'C',
      });
      expect(result.score).toBe(21);
      expect(result.profile).toBe('aggressive');
    });

    it('should return aggressive for score boundary 17', () => {
      const result = service.assessRiskProfile({
        revenueScale: 'C',
        debtRatio: 'C',
        cashCycleDays: 'C',
        yearsInBusiness: 'A',
        industryRisk: 'C',
        emergencyFund: 'A',
        investmentExperience: 'C',
      });
      expect(result.score).toBe(3 + 3 + 3 + 1 + 3 + 1 + 3);
      expect(result.score).toBe(17);
      expect(result.profile).toBe('aggressive');
    });

    it('should handle mixed answers correctly', () => {
      const result = service.assessRiskProfile({
        revenueScale: 'A',
        debtRatio: 'C',
        cashCycleDays: 'B',
        yearsInBusiness: 'C',
        industryRisk: 'A',
        emergencyFund: 'B',
        investmentExperience: 'C',
      });
      expect(result.score).toBe(1 + 3 + 2 + 3 + 1 + 2 + 3);
      expect(result.score).toBe(15);
      expect(result.profile).toBe('stable');
    });
  });

  describe('getProductsByProfile', () => {
    it('should return 3 products for conservative profile', () => {
      const products = service.getProductsByProfile('conservative');
      expect(products).toHaveLength(3);
      expect(products.every(p => p.riskLevel === 1)).toBe(true);
    });

    it('should return 3 products for stable profile', () => {
      const products = service.getProductsByProfile('stable');
      expect(products).toHaveLength(3);
      expect(products.every(p => p.riskLevel === 2)).toBe(true);
    });

    it('should return 3 products for aggressive profile', () => {
      const products = service.getProductsByProfile('aggressive');
      expect(products).toHaveLength(3);
      expect(products.every(p => p.riskLevel === 3)).toBe(true);
    });

    it('should default to conservative for unknown profile', () => {
      const products = service.getProductsByProfile('unknown' as any);
      expect(products).toHaveLength(3);
      expect(products.every(p => p.riskLevel === 1)).toBe(true);
    });

    it('should filter products by liquidity days', () => {
      const products = service.getProductsByProfile('aggressive', 3);
      expect(products).toHaveLength(2);
      expect(products.every(p => p.liquidityDays <= 3)).toBe(true);
    });

    it('should return empty array when liquidity filter too strict', () => {
      const products = service.getProductsByProfile('stable', 1);
      expect(products).toHaveLength(0);
    });

    it('should include product details', () => {
      const products = service.getProductsByProfile('stable');
      products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('expectedReturn');
        expect(product).toHaveProperty('riskLevel');
        expect(product).toHaveProperty('liquidityDays');
        expect(product).toHaveProperty('description');
      });
    });
  });

  describe('getPortfolioMetrics', () => {
    it('should return metrics for conservative profile', () => {
      const metrics = service.getPortfolioMetrics('conservative');
      expect(metrics.expectedReturn).toBe(2.5);
      expect(metrics.riskLevel).toBe(1);
      expect(metrics.liquidityScore).toBe(95);
      expect(metrics.allocation).toEqual({ CASH: 30, DEPOSIT: 40, FUND: 25, STOCK: 5 });
    });

    it('should return metrics for stable profile', () => {
      const metrics = service.getPortfolioMetrics('stable');
      expect(metrics.expectedReturn).toBe(4.5);
      expect(metrics.riskLevel).toBe(2);
      expect(metrics.liquidityScore).toBe(75);
      expect(metrics.allocation).toEqual({ CASH: 15, DEPOSIT: 30, FUND: 40, STOCK: 15 });
    });

    it('should return metrics for aggressive profile', () => {
      const metrics = service.getPortfolioMetrics('aggressive');
      expect(metrics.expectedReturn).toBe(8.5);
      expect(metrics.riskLevel).toBe(3);
      expect(metrics.liquidityScore).toBe(50);
      expect(metrics.allocation).toEqual({ CASH: 5, DEPOSIT: 15, FUND: 35, STOCK: 45 });
    });

    it('should default to conservative for unknown profile', () => {
      const metrics = service.getPortfolioMetrics('unknown' as any);
      expect(metrics.expectedReturn).toBe(2.5);
      expect(metrics.riskLevel).toBe(1);
    });
  });

  describe('getStrategyTemplates', () => {
    it('should return 3 templates', () => {
      const templates = service.getStrategyTemplates();
      expect(templates).toHaveLength(3);
    });

    it('should contain conservative, stable and aggressive templates', () => {
      const templates = service.getStrategyTemplates();
      const names = templates.map(t => t.name);
      expect(names).toContain('保守型策略');
      expect(names).toContain('稳健型策略');
      expect(names).toContain('进取型策略');
    });

    it('should include full template details', () => {
      const templates = service.getStrategyTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('allocation');
        expect(template).toHaveProperty('suitableFor');
        expect(template).toHaveProperty('executionGuide');
      });
    });
  });
});
