import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowVelocityController } from './CashFlowVelocityController';
import { CashFlowVelocityService } from '../services/CashFlowVelocityService';

describe('CashFlowVelocityController', () => {
  let controller: CashFlowVelocityController;

  const mockCashFlowVelocityService = {
    getCashFlowVelocity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashFlowVelocityController],
      providers: [
        {
          provide: CashFlowVelocityService,
          useValue: mockCashFlowVelocityService,
        },
      ],
    }).compile();

    controller = module.get<CashFlowVelocityController>(CashFlowVelocityController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /data-product/cash-flow-velocity', () => {
    it('should return all industries when no query param', async () => {
      const mockData = [
        { industryCode: '51', industryName: '批发业', avgTurnoverRate: 68.5, avgLiquidityScore: 72.3, avgPaymentCycleDays: 45, avgReceivableCycleDays: 38, sampleSize: 1250, periodStart: '2026-04-13', periodEnd: '2026-05-13' },
        { industryCode: '52', industryName: '零售业', avgTurnoverRate: 82.1, avgLiquidityScore: 65.8, avgPaymentCycleDays: 30, avgReceivableCycleDays: 12, sampleSize: 2340, periodStart: '2026-04-13', periodEnd: '2026-05-13' },
      ];
      mockCashFlowVelocityService.getCashFlowVelocity.mockResolvedValue(mockData);

      const result = await controller.getCashFlowVelocity();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockCashFlowVelocityService.getCashFlowVelocity).toHaveBeenCalledWith(undefined);
    });

    it('should filter by industry when query param provided', async () => {
      const mockData = [
        { industryCode: '51', industryName: '批发业', avgTurnoverRate: 68.5, avgLiquidityScore: 72.3, avgPaymentCycleDays: 45, avgReceivableCycleDays: 38, sampleSize: 1250, periodStart: '2026-04-13', periodEnd: '2026-05-13' },
      ];
      mockCashFlowVelocityService.getCashFlowVelocity.mockResolvedValue(mockData);

      const result = await controller.getCashFlowVelocity('51');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].industryCode).toBe('51');
      expect(mockCashFlowVelocityService.getCashFlowVelocity).toHaveBeenCalledWith('51');
    });

    it('should return empty data when service returns empty array', async () => {
      mockCashFlowVelocityService.getCashFlowVelocity.mockResolvedValue([]);

      const result = await controller.getCashFlowVelocity('99');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});
