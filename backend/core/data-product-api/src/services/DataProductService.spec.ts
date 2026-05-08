import { Test, TestingModule } from '@nestjs/testing';
import { DataProductService } from './DataProductService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvestmentSentiment } from '../entities/InvestmentSentiment.entity';

describe('DataProductService', () => {
  let service: DataProductService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});