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

  describe('generateRecommendation', () => {
    it('should return conservative allocation for conservative risk profile', () => {
      const result = service.generateRecommendation('conservative');
      expect(result.riskProfile).toBe('conservative');
      expect(result.allocation).toEqual({ CASH: 20, DEPOSIT: 50, FUND: 20, STOCK: 10 });
      expect(result.riskLevel).toBe(1);
    });

    it('should return moderate allocation for moderate risk profile', () => {
      const result = service.generateRecommendation('moderate');
      expect(result.riskProfile).toBe('moderate');
      expect(result.allocation).toEqual({ CASH: 10, DEPOSIT: 30, FUND: 40, STOCK: 20 });
      expect(result.riskLevel).toBe(2);
    });

    it('should return aggressive allocation for aggressive risk profile', () => {
      const result = service.generateRecommendation('aggressive');
      expect(result.riskProfile).toBe('aggressive');
      expect(result.allocation).toEqual({ CASH: 5, DEPOSIT: 15, FUND: 30, STOCK: 50 });
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
});
