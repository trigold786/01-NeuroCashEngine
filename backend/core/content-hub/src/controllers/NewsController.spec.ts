import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './NewsController';
import { NewsService } from '../services/NewsService';
import { NewsCategory, NewsSourceType } from '../entities/News.entity';

describe('NewsController', () => {
  let controller: NewsController;
  let service: NewsService;

  const mockNewsService = {
    seedDemoData: jest.fn(),
    getCategories: jest.fn(),
    getNewsList: jest.fn(),
    getNewsById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: mockNewsService,
        },
      ],
    }).compile();

    controller = module.get<NewsController>(NewsController);
    service = module.get<NewsService>(NewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call seedDemoData on initialization', async () => {
      mockNewsService.seedDemoData.mockResolvedValue(undefined);
      await controller.onModuleInit();
      expect(mockNewsService.seedDemoData).toHaveBeenCalled();
    });
  });

  describe('getCategories', () => {
    it('should return category list', async () => {
      const mockCategories = [
        { key: NewsCategory.GENERAL, label: '综合' },
        { key: NewsCategory.STOCK, label: '股票' },
      ];
      mockNewsService.getCategories.mockResolvedValue(mockCategories);

      const result = await controller.getCategories();

      expect(mockNewsService.getCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getNewsList', () => {
    it('should return paginated news list', async () => {
      const mockResult = {
        list: [
          { id: 'news-1', title: 'News 1', category: NewsCategory.STOCK },
          { id: 'news-2', title: 'News 2', category: NewsCategory.STOCK },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };
      mockNewsService.getNewsList.mockResolvedValue(mockResult);

      const result = await controller.getNewsList(
        NewsCategory.STOCK,
        undefined,
        undefined,
        '1',
        '20',
      );

      expect(mockNewsService.getNewsList).toHaveBeenCalledWith(
        NewsCategory.STOCK,
        undefined,
        undefined,
        1,
        20,
      );
      expect(result).toEqual(mockResult);
    });

    it('should use default pagination when not provided', async () => {
      mockNewsService.getNewsList.mockResolvedValue({ list: [], total: 0, page: 1, limit: 20 });

      await controller.getNewsList(undefined, undefined, undefined, undefined, undefined);

      expect(mockNewsService.getNewsList).toHaveBeenCalledWith(undefined, undefined, undefined, 1, 20);
    });

    it('should filter by keyword', async () => {
      mockNewsService.getNewsList.mockResolvedValue({ list: [], total: 0, page: 1, limit: 20 });

      await controller.getNewsList(undefined, undefined, '央行', '1', '20');

      expect(mockNewsService.getNewsList).toHaveBeenCalledWith(
        undefined,
        undefined,
        '央行',
        1,
        20,
      );
    });
  });

  describe('getNews', () => {
    it('should return news by id', async () => {
      const mockNews = { id: 'news-1', title: 'News 1', viewCount: 10 };
      mockNewsService.getNewsById.mockResolvedValue(mockNews);

      const result = await controller.getNews('news-1');

      expect(mockNewsService.getNewsById).toHaveBeenCalledWith('news-1');
      expect(result).toEqual(mockNews);
    });
  });
});