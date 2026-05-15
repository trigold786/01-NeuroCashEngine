import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './NewsService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { News, NewsCategory, NewsSourceType } from '../entities/News.entity';
import { NotFoundException } from '@nestjs/common';

describe('NewsService', () => {
  let service: NewsService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        NewsService,
        {
          provide: getRepositoryToken(News),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDemoData', () => {
    it('should not re-initialize if data exists', async () => {
      mockRepository.count.mockResolvedValue(6);
      await service.seedDemoData();
      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should initialize demo data when empty', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockImplementation(data => data);
      mockRepository.save.mockResolvedValue({});
      await service.seedDemoData();
      expect(mockRepository.create).toHaveBeenCalledTimes(6);
    });
  });

  describe('getNewsList', () => {
    it('should return paginated news list', async () => {
      const mockList = [
        { id: '1', title: 'News 1', category: NewsCategory.STOCK },
        { id: '2', title: 'News 2', category: NewsCategory.STOCK },
      ];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockList, 2]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getNewsList(undefined, undefined, undefined, 1, 20);

      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter by category', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getNewsList(NewsCategory.STOCK);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('news.category = :category', { category: NewsCategory.STOCK });
    });

    it('should filter by keyword', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getNewsList(undefined, undefined, '央行');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(news.title ILike :keyword OR news.summary ILike :keyword)',
        { keyword: '%央行%' }
      );
    });
  });

  describe('getCategories', () => {
    it('should return category list', async () => {
      const result = await service.getCategories();
      expect(result).toHaveLength(5);
      expect(result[0]).toHaveProperty('key');
      expect(result[0]).toHaveProperty('label');
    });
  });

  describe('getNewsById', () => {
    it('should return news with incremented view count', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'Test News',
        viewCount: 10,
      };

      mockRepository.findOne.mockResolvedValue(mockNews);
      mockRepository.increment.mockResolvedValue({ affected: 1 });

      const result = await service.getNewsById('news-1');

      expect(result.id).toBe('news-1');
      expect(result.viewCount).toBe(11);
      expect(mockRepository.increment).toHaveBeenCalledWith({ id: 'news-1' }, 'viewCount', 1);
    });

    it('should throw NotFoundException when news not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getNewsById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});