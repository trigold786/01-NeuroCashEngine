import { Test, TestingModule } from '@nestjs/testing';
import { DataProductController } from './DataProductController';
import { DataProductService } from '../services/DataProductService';
import { AssetCategory } from '../entities/InvestmentSentiment.entity';

describe('DataProductController', () => {
  let controller: DataProductController;
  let service: DataProductService;

  const mockDataProductService = {
    getInvestmentSentiment: jest.fn(),
    getLatestSentimentOverview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataProductController],
      providers: [
        {
          provide: DataProductService,
          useValue: mockDataProductService,
        },
      ],
    }).compile();

    controller = module.get<DataProductController>(DataProductController);
    service = module.get<DataProductService>(DataProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getInvestmentSentiment', () => {
    it('should return investment sentiment with filters', async () => {
      const mockResult = {
        success: true,
        data: [
          { date: '2026-05-01', assetCategory: AssetCategory.CASH, sentimentScore: 82.5 },
          { date: '2026-05-01', assetCategory: AssetCategory.DEPOSIT, sentimentScore: 71.2 },
        ],
      };
      mockDataProductService.getInvestmentSentiment.mockResolvedValue(mockResult);

      const result = await controller.getInvestmentSentiment('2026-05-01', '2026-05-10', AssetCategory.CASH);

      expect(mockDataProductService.getInvestmentSentiment).toHaveBeenCalledWith(
        '2026-05-01',
        '2026-05-10',
        AssetCategory.CASH,
      );
      expect(result).toEqual(mockResult);
    });

    it('should return all data when no filters provided', async () => {
      const mockResult = { success: true, data: [] };
      mockDataProductService.getInvestmentSentiment.mockResolvedValue(mockResult);

      const result = await controller.getInvestmentSentiment(undefined, undefined, undefined);

      expect(mockDataProductService.getInvestmentSentiment).toHaveBeenCalledWith(undefined, undefined, undefined);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getLatestSentimentOverview', () => {
    it('should return latest sentiment overview', async () => {
      const mockResult = {
        success: true,
        data: [
          { date: '2026-05-10', assetCategory: AssetCategory.CASH, sentimentScore: 82.5 },
        ],
      };
      mockDataProductService.getLatestSentimentOverview.mockResolvedValue(mockResult);

      const result = await controller.getLatestSentimentOverview();

      expect(mockDataProductService.getLatestSentimentOverview).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      const result = await controller.getHealth();

      expect(result.success).toBe(true);
      expect(result.service).toBe('data-product-api');
      expect(result.timestamp).toBeDefined();
    });
  });
});