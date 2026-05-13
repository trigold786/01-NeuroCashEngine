import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowService } from './CashFlowService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { UserAssetAccount } from '../entities/UserAssetAccount.entity';
import { NotFoundException } from '@nestjs/common';

describe('CashFlowService', () => {
  let service: CashFlowService;

  const mockRecordRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockAccountRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashFlowService,
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

    service = module.get<CashFlowService>(CashFlowService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecord', () => {
    it('should create cash flow record successfully', async () => {
      const userId = 'user-1';
      const dto = {
        accountId: 'acc-1',
        tradeType: 'INFLOW',
        amount: 1000,
        tradeTime: new Date().toISOString(),
      };

      mockAccountRepository.findOne.mockResolvedValue({ accountId: 'acc-1', userId });
      mockRecordRepository.create.mockReturnValue({ ...dto, userId });
      mockRecordRepository.save.mockResolvedValue({ id: 'record-1', ...dto, userId });

      const result = await service.createRecord(userId, dto);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { accountId: 'acc-1', userId },
      });
      expect(mockRecordRepository.create).toHaveBeenCalled();
      expect(mockRecordRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.createRecord('user-1', {
        accountId: 'non-existent',
        tradeType: 'INFLOW',
        amount: 1000,
        tradeTime: new Date().toISOString(),
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRecordsByAccount', () => {
    it('should return records for valid account', async () => {
      const accountId = 'acc-1';
      const userId = 'user-1';
      const mockRecords = [
        { id: 'rec-1', accountId, tradeType: 'INFLOW', amount: 1000 },
        { id: 'rec-2', accountId, tradeType: 'OUTFLOW', amount: 500 },
      ];

      mockAccountRepository.findOne.mockResolvedValue({ accountId, userId });
      mockRecordRepository.find.mockResolvedValue(mockRecords);

      const result = await service.getRecordsByAccount(accountId, userId);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { accountId, userId },
      });
      expect(mockRecordRepository.find).toHaveBeenCalledWith({
        where: { accountId },
        order: { tradeTime: 'DESC' },
      });
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.getRecordsByAccount('non-existent', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});