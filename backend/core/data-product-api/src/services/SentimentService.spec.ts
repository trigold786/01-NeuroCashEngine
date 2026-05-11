import { Test, TestingModule } from '@nestjs/testing';
import { SentimentService } from './SentimentService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvestmentSentiment, AssetCategory } from '../entities/InvestmentSentiment.entity';

describe('SentimentService', () => {
  let service: SentimentService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
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

      mockRepository.findOne.mockImplementation(({ where }) => {
        const category = where.assetCategory;
        const found = mockData.find(d => d.assetCategory === category);
        return Promise.resolve(found || null);
      });

      const result = await service.getInvestmentSentiment();

      expect(result).toHaveLength(4);
      expect(result[0].assetCategory).toBe(AssetCategory.CASH);
      expect(result[1].assetCategory).toBe(AssetCategory.DEPOSIT);
      expect(result[2].assetCategory).toBe(AssetCategory.FUND);
      expect(result[3].assetCategory).toBe(AssetCategory.STOCK);
    });

    it('should fallback to any existing data when today has no data', async () => {
      const mockCashData = { date: '2026-05-01', assetCategory: AssetCategory.CASH, sentimentScore: 45.5, totalSamples: 100 };
      mockRepository.findOne.mockResolvedValue(null);
      let callCount = 0;
      mockRepository.findOne.mockImplementation(() => {
        callCount++;
        if (callCount === 8) return Promise.resolve(mockCashData);
        return Promise.resolve(null);
      });

      const result = await service.getInvestmentSentiment();

      expect(result).toHaveLength(1);
      expect(result[0].assetCategory).toBe(AssetCategory.CASH);
      expect(result[0].date).toBe('2026-05-01');
    });

    it('should return empty array when no data exists', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getInvestmentSentiment();

      expect(result).toHaveLength(0);
    });
  });
});