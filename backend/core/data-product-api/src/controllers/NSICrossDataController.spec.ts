import { Test, TestingModule } from '@nestjs/testing';
import { NSICrossDataController } from './NSICrossDataController';
import { NSICrossDataService } from '../services/NSICrossDataService';

describe('NSICrossDataController', () => {
  let controller: NSICrossDataController;

  const mockNSICrossDataService = {
    getCrossDataOverview: jest.fn(),
    getHealthDistribution: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NSICrossDataController],
      providers: [
        { provide: NSICrossDataService, useValue: mockNSICrossDataService },
      ],
    }).compile();

    controller = module.get<NSICrossDataController>(NSICrossDataController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /data-product/nsi-cross-data/overview', () => {
    it('should return cross data overview', async () => {
      const mockData = {
        totalUsers: 1000,
        avgHealthScore: 65.5,
        riskDistribution: [],
        insuranceDistribution: [],
        investmentDistribution: [],
      };
      mockNSICrossDataService.getCrossDataOverview.mockResolvedValue(mockData);

      const result = await controller.getCrossDataOverview();
      expect(result.success).toBe(true);
      expect(result.data.totalUsers).toBe(1000);
      expect(result.data.avgHealthScore).toBe(65.5);
      expect(mockNSICrossDataService.getCrossDataOverview).toHaveBeenCalled();
    });
  });

  describe('GET /data-product/nsi-cross-data/distribution', () => {
    it('should return health distribution', async () => {
      const mockData = [
        { range: '61-80', count: 3, percentage: 30 },
        { range: '81-100', count: 3, percentage: 30 },
      ];
      mockNSICrossDataService.getHealthDistribution.mockResolvedValue(mockData);

      const result = await controller.getHealthDistribution();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockNSICrossDataService.getHealthDistribution).toHaveBeenCalled();
    });

    it('should return empty when no data', async () => {
      mockNSICrossDataService.getHealthDistribution.mockResolvedValue([]);

      const result = await controller.getHealthDistribution();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});
