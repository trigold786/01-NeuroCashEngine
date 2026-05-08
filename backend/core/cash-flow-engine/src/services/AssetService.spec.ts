import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from './AssetService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAssetAccount } from '../entities/UserAssetAccount.entity';

describe('AssetService', () => {
  let service: AssetService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        {
          provide: getRepositoryToken(UserAssetAccount),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});