import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowVelocityService, CashFlowVelocityResponse } from './CashFlowVelocityService';

describe('CashFlowVelocityService', () => {
  let service: CashFlowVelocityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashFlowVelocityService],
    }).compile();

    service = module.get<CashFlowVelocityService>(CashFlowVelocityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCashFlowVelocity', () => {
    it('should return all 6 industries when no filter', async () => {
      const result = await service.getCashFlowVelocity();
      expect(result).toHaveLength(6);
    });

    it('should return all required fields for each industry', async () => {
      const result = await service.getCashFlowVelocity();
      for (const item of result) {
        expect(item.industryCode).toBeDefined();
        expect(item.industryName).toBeDefined();
        expect(item.avgTurnoverRate).toBeGreaterThanOrEqual(0);
        expect(item.avgTurnoverRate).toBeLessThanOrEqual(100);
        expect(item.avgLiquidityScore).toBeGreaterThanOrEqual(0);
        expect(item.avgLiquidityScore).toBeLessThanOrEqual(100);
        expect(item.avgPaymentCycleDays).toBeGreaterThan(0);
        expect(item.avgReceivableCycleDays).toBeGreaterThanOrEqual(0);
        expect(item.sampleSize).toBeGreaterThan(0);
        expect(item.periodStart).toBeDefined();
        expect(item.periodEnd).toBeDefined();
      }
    });

    it('should filter by industry code 51', async () => {
      const result = await service.getCashFlowVelocity('51');
      expect(result).toHaveLength(1);
      expect(result[0].industryCode).toBe('51');
      expect(result[0].industryName).toBe('批发业');
    });

    it('should filter by industry code 62', async () => {
      const result = await service.getCashFlowVelocity('62');
      expect(result).toHaveLength(1);
      expect(result[0].industryCode).toBe('62');
      expect(result[0].industryName).toBe('餐饮业');
    });

    it('should return empty array for unknown industry code', async () => {
      const result = await service.getCashFlowVelocity('99');
      expect(result).toHaveLength(0);
    });

    it('should have periodStart and periodEnd as valid date strings', async () => {
      const result = await service.getCashFlowVelocity();
      for (const item of result) {
        expect(item.periodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(item.periodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });
});
