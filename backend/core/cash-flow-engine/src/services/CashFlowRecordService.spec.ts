import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowRecordService } from './CashFlowRecordService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { UserAssetAccount } from '../entities/UserAssetAccount.entity';

describe('CashFlowRecordService', () => {
  let service: CashFlowRecordService;

  const mockRecordRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  const mockAccountRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashFlowRecordService,
        {
          provide: getRepositoryToken(CashFlowRecord),
          useValue: mockRecordRepository,
        },
        {
          provide: getRepositoryToken(UserAssetAccount),
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<CashFlowRecordService>(CashFlowRecordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDemoData', () => {
    it('should skip if records already exist', async () => {
      mockRecordRepository.count.mockResolvedValue(10);
      const result = await service.seedDemoData('user-1');
      expect(result.message).toContain('skipping');
    });

    it('should create accounts and seed records', async () => {
      mockRecordRepository.count.mockResolvedValue(0);
      mockAccountRepository.find.mockResolvedValue([]);
      const mockAccount = { accountId: 'acc-1', accountName: 'Test', accountType: 0, currency: 'CNY', userId: 'user-1' };
      mockAccountRepository.create.mockReturnValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(mockAccount);
      mockRecordRepository.save.mockImplementation(async (records) => records);

      const result = await service.seedDemoData('user-1');
      expect(result.count).toBeGreaterThan(0);
      expect(result.message).toContain('successfully');
    });

    it('should use existing accounts if present', async () => {
      mockRecordRepository.count.mockResolvedValue(0);
      mockAccountRepository.find.mockResolvedValue([
        { accountId: 'acc-1', userId: 'user-1' },
        { accountId: 'acc-2', userId: 'user-1' },
      ]);
      mockRecordRepository.save.mockImplementation(async (records) => records);

      const result = await service.seedDemoData('user-1');
      expect(result.count).toBeGreaterThan(0);
    });
  });

  describe('getRecords', () => {
    it('should return paginated records', async () => {
      mockAccountRepository.find.mockResolvedValue([{ accountId: 'acc-1' }]);
      const mockData = [{ recordId: 'r1', amount: 100 }];
      mockRecordRepository.findAndCount.mockResolvedValue([mockData, 1]);

      const result = await service.getRecords('user-1', { page: 1, limit: 20 });
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should return empty when no accounts', async () => {
      mockAccountRepository.find.mockResolvedValue([]);
      const result = await service.getRecords('user-1');
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should apply date filters', async () => {
      mockAccountRepository.find.mockResolvedValue([{ accountId: 'acc-1' }]);
      mockRecordRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getRecords('user-1', { startDate: '2024-01-01', endDate: '2024-12-31' });
      expect(mockRecordRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should compute income/expense summary', async () => {
      mockAccountRepository.find.mockResolvedValue([{ accountId: 'acc-1' }]);
      mockRecordRepository.find.mockResolvedValue([
        { amount: 8500, aiCategoryId: 20, count: 1 },
        { amount: -200, aiCategoryId: 5, count: 1 },
        { amount: -50, aiCategoryId: 3, count: 1 },
        { amount: 500, aiCategoryId: 20, count: 1 },
      ]);

      const result = await service.getStatistics('user-1');
      expect(result.totalIncome).toBe(9000);
      expect(result.totalExpense).toBe(250);
      expect(result.netAmount).toBe(8750);
    });

    it('should return empty when no accounts', async () => {
      mockAccountRepository.find.mockResolvedValue([]);
      const result = await service.getStatistics('user-1');
      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
    });
  });
});
