import { Test, TestingModule } from '@nestjs/testing';
import { NSICrossDataService } from './NSICrossDataService';

describe('NSICrossDataService', () => {
  let service: NSICrossDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NSICrossDataService],
    }).compile();

    service = module.get<NSICrossDataService>(NSICrossDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCrossDataOverview', () => {
    it('should return overview with total users', async () => {
      const result = await service.getCrossDataOverview();
      expect(result.totalUsers).toBe(10);
    });

    it('should have avgHealthScore between 0 and 100', async () => {
      const result = await service.getCrossDataOverview();
      expect(result.avgHealthScore).toBeGreaterThan(0);
      expect(result.avgHealthScore).toBeLessThanOrEqual(100);
    });

    it('should have risk distribution summing to 100%', async () => {
      const result = await service.getCrossDataOverview();
      const totalPct = result.riskDistribution.reduce((s, d) => s + d.percentage, 0);
      expect(totalPct).toBeCloseTo(100, 1);
    });

    it('should have insurance distribution', async () => {
      const result = await service.getCrossDataOverview();
      expect(result.insuranceDistribution.length).toBeGreaterThanOrEqual(1);
      const totalPct = result.insuranceDistribution.reduce((s, d) => s + d.percentage, 0);
      expect(totalPct).toBeCloseTo(100, 1);
    });

    it('should have investment distribution', async () => {
      const result = await service.getCrossDataOverview();
      expect(result.investmentDistribution.length).toBeGreaterThanOrEqual(1);
    });

    it('should have all required fields', async () => {
      const result = await service.getCrossDataOverview();
      expect(result.totalUsers).toBeDefined();
      expect(result.avgHealthScore).toBeDefined();
      expect(result.riskDistribution).toBeInstanceOf(Array);
      expect(result.insuranceDistribution).toBeInstanceOf(Array);
      expect(result.investmentDistribution).toBeInstanceOf(Array);
    });
  });

  describe('getHealthDistribution', () => {
    it('should return 5 health score ranges', async () => {
      const result = await service.getHealthDistribution();
      expect(result).toHaveLength(5);
    });

    it('each range should have label, count, percentage', async () => {
      const result = await service.getHealthDistribution();
      for (const item of result) {
        expect(item.range).toBeDefined();
        expect(item.count).toBeGreaterThanOrEqual(0);
        expect(item.percentage).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sum to 100%', async () => {
      const result = await service.getHealthDistribution();
      const totalPct = result.reduce((s, d) => s + d.percentage, 0);
      expect(totalPct).toBeCloseTo(100, 1);
    });

    it('ranges should be valid', async () => {
      const result = await service.getHealthDistribution();
      const expectedRanges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
      expect(result.map(r => r.range)).toEqual(expectedRanges);
    });
  });
});
