import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './NewsService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { News } from '../entities/News.entity';

describe('NewsService', () => {
  let service: NewsService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});