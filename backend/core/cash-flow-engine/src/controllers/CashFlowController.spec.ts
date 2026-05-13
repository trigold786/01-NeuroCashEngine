import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowController } from './CashFlowController';
import { CashFlowService } from '../services/CashFlowService';
import { CashFlowRecordService } from '../services/CashFlowRecordService';

describe('CashFlowController', () => {
  let controller: CashFlowController;

  const mockCashFlowService = {
    createRecord: jest.fn(),
    getRecordsByAccount: jest.fn(),
  };

  const mockCashFlowRecordService = {
    seedDemoData: jest.fn(),
    getStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashFlowController],
      providers: [
        { provide: CashFlowService, useValue: mockCashFlowService },
        { provide: CashFlowRecordService, useValue: mockCashFlowRecordService },
      ],
    }).compile();

    controller = module.get<CashFlowController>(CashFlowController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRecord', () => {
    it('should create record for demo user', async () => {
      const dto = { accountId: 'acc-1', tradeType: 'INFLOW', amount: 1000, tradeTime: new Date().toISOString() };
      const req = {};
      mockCashFlowService.createRecord.mockResolvedValue({ id: 'r1' });
      const result = await controller.createRecord(dto, req);
      expect(mockCashFlowService.createRecord).toHaveBeenCalledWith('demo-user-1', dto);
      expect(result).toEqual({ id: 'r1' });
    });
  });

  describe('getRecords', () => {
    it('should return records by account', async () => {
      const req = {};
      mockCashFlowService.getRecordsByAccount.mockResolvedValue([{ recordId: 'r1' }]);
      const result = await controller.getRecords('acc-1', req);
      expect(mockCashFlowService.getRecordsByAccount).toHaveBeenCalledWith('acc-1', 'demo-user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('seedDemoData', () => {
    it('should seed demo data', async () => {
      const req = {};
      mockCashFlowRecordService.seedDemoData.mockResolvedValue({ count: 200, message: 'ok' });
      const result = await controller.seedDemoData(req);
      expect(mockCashFlowRecordService.seedDemoData).toHaveBeenCalledWith('demo-user-1');
      expect(result.count).toBe(200);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const req = {};
      const mockStats = { totalIncome: 10000, totalExpense: 3000, netAmount: 7000, byCategory: [], totalRecords: 50 };
      mockCashFlowRecordService.getStatistics.mockResolvedValue(mockStats);
      const result = await controller.getStatistics(req, '2024-01-01', '2024-12-31');
      expect(mockCashFlowRecordService.getStatistics).toHaveBeenCalledWith('demo-user-1', '2024-01-01', '2024-12-31');
      expect(result).toEqual(mockStats);
    });
  });
});
