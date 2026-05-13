import { Test, TestingModule } from '@nestjs/testing';
import { ProductPreferenceService } from './ProductPreferenceService';

describe('ProductPreferenceService', () => {
  let service: ProductPreferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductPreferenceService],
    }).compile();

    service = module.get<ProductPreferenceService>(ProductPreferenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProductPreference', () => {
    it('should return all 5 regions when no filter', async () => {
      const result = await service.getProductPreference();
      expect(result).toHaveLength(5);
    });

    it('should return required structure for each region', async () => {
      const result = await service.getProductPreference();
      for (const item of result) {
        expect(item.region).toBeDefined();
        expect(item.totalUsers).toBeGreaterThan(0);
        expect(item.preferenceDistribution).toHaveLength(4);
        expect(item.riskProfileDistribution).toHaveLength(3);

        for (const pref of item.preferenceDistribution) {
          expect(pref.assetCategory).toBeDefined();
          expect(pref.avgAllocation).toBeGreaterThanOrEqual(0);
          expect(pref.userCount).toBeGreaterThan(0);
          expect(['up', 'down', 'stable']).toContain(pref.trend);
        }

        for (const risk of item.riskProfileDistribution) {
          expect(['conservative', 'moderate', 'aggressive']).toContain(risk.profile);
          expect(risk.percentage).toBeGreaterThan(0);
          expect(risk.userCount).toBeGreaterThan(0);
        }
      }
    });

    it('should filter by region', async () => {
      const result = await service.getProductPreference('east');
      expect(result).toHaveLength(1);
      expect(result[0].region).toBe('east');
    });

    it('should return empty array for unknown region', async () => {
      const result = await service.getProductPreference('unknown');
      expect(result).toHaveLength(0);
    });

    it('should have valid preference distribution trends', async () => {
      const result = await service.getProductPreference();
      for (const item of result) {
        for (const pref of item.preferenceDistribution) {
          expect(['up', 'down', 'stable']).toContain(pref.trend);
        }
      }
    });
  });
});
