import { Test, TestingModule } from '@nestjs/testing';
import { DataProductService } from './DataProductService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvestmentSentiment, AssetCategory } from '../entities/InvestmentSentiment.entity';

describe('DataProductService', () => {
  let service: DataProductService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataProductService,
        {
          provide: getRepositoryToken(InvestmentSentiment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DataProductService>(DataProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDemoData', () => {
    it('should not re-initialize if data exists', async () => {
      mockRepository.count.mockResolvedValue(30);
      await service.seedDemoData();
      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should initialize demo data when empty', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockImplementation(data => data);
      mockRepository.save.mockResolvedValue({});
      await service.seedDemoData();
      expect(mockRepository.create).toHaveBeenCalledTimes(150);
    });
  });

  describe('getInvestmentSentiment', () => {
    it('should return sentiment data with filters', async () => {
      const mockData = [
        { date: '2026-05-01', assetCategory: AssetCategory.CASH, sentimentScore: 82.5, totalSamples: 5000 },
        { date: '2026-05-01', assetCategory: AssetCategory.DEPOSIT, sentimentScore: 71.2, totalSamples: 3000 },
      ];

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockData),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getInvestmentSentiment('2026-05-01', '2026-05-10', AssetCategory.CASH);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });

    it('should return all data without filters', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getInvestmentSentiment();

      expect(result.success).toBe(true);
    });
  });

  describe('getLatestSentimentOverview', () => {
    it('should return latest sentiment overview', async () => {
      const mockLatestData = [
        { date: '2026-05-10', assetCategory: AssetCategory.CASH, sentimentScore: 82.5, totalSamples: 5000 },
        { date: '2026-05-10', assetCategory: AssetCategory.DEPOSIT, sentimentScore: 71.2, totalSamples: 3000 },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxDate: '2026-05-10' }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.find.mockResolvedValue(mockLatestData);

      const result = await service.getLatestSentimentOverview();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty data when no sentiment exists', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxDate: null }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getLatestSentimentOverview();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});