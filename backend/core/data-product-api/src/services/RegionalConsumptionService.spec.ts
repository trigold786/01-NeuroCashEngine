import { Test, TestingModule } from '@nestjs/testing';
import { RegionalConsumptionService } from './RegionalConsumptionService';

describe('RegionalConsumptionService', () => {
  let service: RegionalConsumptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegionalConsumptionService],
    }).compile();

    service = module.get<RegionalConsumptionService>(RegionalConsumptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRegionalConsumption', () => {
    it('should return all 5 regions when no filter', async () => {
      const result = await service.getRegionalConsumption();
      expect(result).toHaveLength(5);
    });

    it('should return all required fields', async () => {
      const result = await service.getRegionalConsumption();
      for (const item of result) {
        expect(item.region).toBeDefined();
        expect(item.quarter).toBeDefined();
        expect(item.vitalityIndex).toBeGreaterThanOrEqual(0);
        expect(item.vitalityIndex).toBeLessThanOrEqual(100);
        expect(item.consumptionGrowth).toBeDefined();
        expect(item.topCategories).toBeInstanceOf(Array);
        expect(item.topCategories.length).toBeGreaterThan(0);
        expect(item.sampleSize).toBeGreaterThan(0);
      }
    });

    it('should filter by region "east"', async () => {
      const result = await service.getRegionalConsumption('east');
      expect(result).toHaveLength(1);
      expect(result[0].region).toBe('east');
      expect(result[0].vitalityIndex).toBe(78.5);
    });

    it('should filter by region "south"', async () => {
      const result = await service.getRegionalConsumption('south');
      expect(result).toHaveLength(1);
      expect(result[0].region).toBe('south');
      expect(result[0].vitalityIndex).toBe(81.2);
    });

    it('should return empty array for unknown region', async () => {
      const result = await service.getRegionalConsumption('unknown');
      expect(result).toHaveLength(0);
    });

    it('should have valid top categories structure', async () => {
      const result = await service.getRegionalConsumption();
      for (const item of result) {
        for (const cat of item.topCategories) {
          expect(cat.category).toBeDefined();
          expect(cat.percentage).toBeGreaterThan(0);
          expect(cat.percentage).toBeLessThanOrEqual(100);
        }
      }
    });
  });
});
