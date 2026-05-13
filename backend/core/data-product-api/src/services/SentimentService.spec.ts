import { Test, TestingModule } from '@nestjs/testing';
import { SentimentService } from './SentimentService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvestmentSentiment, AssetCategory } from '../entities/InvestmentSentiment.entity';

describe('SentimentService', () => {
  let service: SentimentService;

  const mockRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SentimentService,
        {
          provide: getRepositoryToken(InvestmentSentiment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SentimentService>(SentimentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInvestmentSentiment', () => {
    it('should return sentiment for all 4 asset categories', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockData = [
        { date: today, assetCategory: AssetCategory.CASH, sentimentScore: 45.5, totalSamples: 100 },
        { date: today, assetCategory: AssetCategory.DEPOSIT, sentimentScore: 55.2, totalSamples: 200 },
        { date: today, assetCategory: AssetCategory.FUND, sentimentScore: 65.8, totalSamples: 300 },
        { date: today, assetCategory: AssetCategory.STOCK, sentimentScore: 75.1, totalSamples: 400 },
      ];

      let callCount = 0;
      mockRepository.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve(mockData);
        return Promise.resolve([]);
      });

      const result = await service.getInvestmentSentiment();

      expect(result).toHaveLength(4);
      expect(result[0].assetCategory).toBe(AssetCategory.CASH);
      expect(result[1].assetCategory).toBe(AssetCategory.DEPOSIT);
      expect(result[2].assetCategory).toBe(AssetCategory.FUND);
      expect(result[3].assetCategory).toBe(AssetCategory.STOCK);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should fallback to any existing data when today has no data', async () => {
      const mockCashData = { date: '2026-05-01', assetCategory: AssetCategory.CASH, sentimentScore: 45.5, totalSamples: 100 };
      let callCount = 0;
      mockRepository.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve([]); // no today data
        return Promise.resolve([mockCashData]); // fallback
      });

      const result = await service.getInvestmentSentiment();

      expect(result).toHaveLength(1);
      expect(result[0].assetCategory).toBe(AssetCategory.CASH);
      expect(result[0].date).toBe('2026-05-01');
      expect(mockRepository.find).toHaveBeenCalledTimes(2);
    });

    it('should return empty array when no data exists', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getInvestmentSentiment();

      expect(result).toHaveLength(0);
    });
  });
});