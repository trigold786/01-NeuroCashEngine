import { Test, TestingModule } from '@nestjs/testing';
import { RegionalConsumptionController } from './RegionalConsumptionController';
import { RegionalConsumptionService } from '../services/RegionalConsumptionService';

describe('RegionalConsumptionController', () => {
  let controller: RegionalConsumptionController;

  const mockRegionalConsumptionService = {
    getRegionalConsumption: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegionalConsumptionController],
      providers: [
        { provide: RegionalConsumptionService, useValue: mockRegionalConsumptionService },
      ],
    }).compile();

    controller = module.get<RegionalConsumptionController>(RegionalConsumptionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /data-product/regional-consumption', () => {
    it('should return all regions when no query param', async () => {
      const mockData = [
        { region: 'east', quarter: '2026Q1', vitalityIndex: 78.5, consumptionGrowth: 5.2, topCategories: [], sampleSize: 45600 },
        { region: 'west', quarter: '2026Q1', vitalityIndex: 58.7, consumptionGrowth: 4.1, topCategories: [], sampleSize: 18900 },
      ];
      mockRegionalConsumptionService.getRegionalConsumption.mockResolvedValue(mockData);

      const result = await controller.getRegionalConsumption();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockRegionalConsumptionService.getRegionalConsumption).toHaveBeenCalledWith(undefined);
    });

    it('should filter by region when query param provided', async () => {
      const mockData = [
        { region: 'east', quarter: '2026Q1', vitalityIndex: 78.5, consumptionGrowth: 5.2, topCategories: [], sampleSize: 45600 },
      ];
      mockRegionalConsumptionService.getRegionalConsumption.mockResolvedValue(mockData);

      const result = await controller.getRegionalConsumption('east');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].region).toBe('east');
      expect(mockRegionalConsumptionService.getRegionalConsumption).toHaveBeenCalledWith('east');
    });

    it('should return empty data when service returns empty array', async () => {
      mockRegionalConsumptionService.getRegionalConsumption.mockResolvedValue([]);

      const result = await controller.getRegionalConsumption('unknown');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});
