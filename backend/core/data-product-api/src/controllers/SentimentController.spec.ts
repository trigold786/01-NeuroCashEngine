import { Test, TestingModule } from '@nestjs/testing';
import { SentimentController } from './SentimentController';
import { SentimentService } from '../services/SentimentService';
import { AssetCategory } from '../entities/InvestmentSentiment.entity';

describe('SentimentController', () => {
  let controller: SentimentController;

  const mockSentimentService = {
    getInvestmentSentiment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SentimentController],
      providers: [
        {
          provide: SentimentService,
          useValue: mockSentimentService,
        },
      ],
    }).compile();

    controller = module.get<SentimentController>(SentimentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /sentiment/investment', () => {
    it('should return investment sentiment data', async () => {
      const mockData = [
        { date: '2026-05-11', assetCategory: AssetCategory.CASH, sentimentScore: 45.5, totalSamples: 100 },
        { date: '2026-05-11', assetCategory: AssetCategory.DEPOSIT, sentimentScore: 55.2, totalSamples: 200 },
        { date: '2026-05-11', assetCategory: AssetCategory.FUND, sentimentScore: 65.8, totalSamples: 300 },
        { date: '2026-05-11', assetCategory: AssetCategory.STOCK, sentimentScore: 75.1, totalSamples: 400 },
      ];

      mockSentimentService.getInvestmentSentiment.mockResolvedValue(mockData);

      const result = await controller.getInvestmentSentiment();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(4);
      expect(mockSentimentService.getInvestmentSentiment).toHaveBeenCalled();
    });

    it('should return empty data when no sentiment exists', async () => {
      mockSentimentService.getInvestmentSentiment.mockResolvedValue([]);

      const result = await controller.getInvestmentSentiment();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});