import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataController } from './MarketDataController';
import { MarketDataService } from '../services/MarketDataService';

describe('MarketDataController', () => {
  let controller: MarketDataController;

  const mockService = {
    getStockQuotes: jest.fn().mockResolvedValue([
      { code: '000001', name: '平安银行', price: 12.34 },
    ]),
    getFundNAVs: jest.fn().mockResolvedValue([
      { code: '110011', name: '易方达中小盘', nav: 5.1234 },
    ]),
    getKLine: jest.fn().mockResolvedValue([
      { date: '2026-05-14', close: 12.34 },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketDataController],
      providers: [
        { provide: MarketDataService, useValue: mockService },
      ],
    }).compile();
    controller = module.get<MarketDataController>(MarketDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStockQuotes', () => {
    it('should return stock quotes for given codes', async () => {
      const result = await controller.getStockQuotes('000001');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].code).toBe('000001');
      expect(result.data[0].price).toBe(12.34);
    });

    it('should return empty array for empty codes', async () => {
      const result = await controller.getStockQuotes('');
      expect(result.data).toEqual([]);
    });
  });

  describe('getFundNAVs', () => {
    it('should return fund NAVs', async () => {
      const result = await controller.getFundNAVs('110011');
      expect(result.data[0].nav).toBe(5.1234);
    });

    it('should handle missing codes', async () => {
      const result = await controller.getFundNAVs('');
      expect(result.data).toEqual([]);
    });
  });

  describe('getKLine', () => {
    it('should return KLine data', async () => {
      const result = await controller.getKLine('000001', 'daily', '90');
      expect(result.data[0].close).toBe(12.34);
    });

    it('should handle missing code', async () => {
      const result = await controller.getKLine('', 'daily', '90');
      expect(result.data).toEqual([]);
    });
  });
});
