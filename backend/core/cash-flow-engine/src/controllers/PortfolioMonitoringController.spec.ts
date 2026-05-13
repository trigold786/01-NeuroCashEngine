import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioMonitoringController } from './PortfolioMonitoringController';
import { PortfolioMonitoringService } from '../services/PortfolioMonitoringService';

describe('PortfolioMonitoringController', () => {
  let controller: PortfolioMonitoringController;
  let service: PortfolioMonitoringService;

  const mockService = {
    getPortfolio: jest.fn(),
    getAlerts: jest.fn(),
    acknowledgeAlert: jest.fn(),
    getPerformance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioMonitoringController],
      providers: [
        {
          provide: PortfolioMonitoringService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PortfolioMonitoringController>(PortfolioMonitoringController);
    service = module.get<PortfolioMonitoringService>(PortfolioMonitoringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPortfolio', () => {
    it('should return portfolio summary and holdings', async () => {
      const mockPortfolio = {
        summary: { totalValue: 2000000, totalCost: 1800000, totalPnl: 200000, totalPnlPercent: 11.11, dailyPnl: 5000, riskLevel: '中等', diversification: 72 },
        holdings: [],
      };
      mockService.getPortfolio.mockResolvedValue(mockPortfolio);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getPortfolio(req);

      expect(mockService.getPortfolio).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockPortfolio);
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for user', async () => {
      const mockAlerts = [
        { id: 'ALT-001', type: 'deviation', severity: 'warning', title: 'Test', description: 'Desc', createdAt: new Date(), acknowledged: false },
      ];
      mockService.getAlerts.mockResolvedValue(mockAlerts);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getAlerts(req);

      expect(mockService.getAlerts).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockAlerts);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge alert by id', async () => {
      mockService.acknowledgeAlert.mockResolvedValue({ success: true });

      const req = { user: { id: 'user-1' } };
      const result = await controller.acknowledgeAlert('ALT-001', req);

      expect(mockService.acknowledgeAlert).toHaveBeenCalledWith('user-1', 'ALT-001');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getPerformance', () => {
    it('should return performance with default period 1m', async () => {
      const mockPerf = [{ date: '2025-01-01', value: 1000000, pnl: 0 }];
      mockService.getPerformance.mockResolvedValue(mockPerf);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getPerformance(undefined, req);

      expect(mockService.getPerformance).toHaveBeenCalledWith('user-1', '1m');
      expect(result).toEqual(mockPerf);
    });

    it('should return performance with specified period', async () => {
      const mockPerf = [{ date: '2025-01-01', value: 1000000, pnl: 0 }];
      mockService.getPerformance.mockResolvedValue(mockPerf);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getPerformance('3m', req);

      expect(mockService.getPerformance).toHaveBeenCalledWith('user-1', '3m');
      expect(result).toEqual(mockPerf);
    });
  });
});
