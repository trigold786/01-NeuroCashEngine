import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataService } from './MarketDataService';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('MarketDataService', () => {
  let service: MarketDataService;
  let http: HttpService;

  const mockStockResponse = { data: { data: { diff: [
    { f12: '000001', f14: '平安银行', f2: 12.34, f3: 1.23, f4: 0.15 },
    { f12: '600519', f14: '贵州茅台', f2: 1850.00, f3: -0.50, f4: -9.25 },
  ]}}};

  const mockEmptyStockResponse = { data: { data: { total: 2, diff: [
    { f12: '000001', f14: '平安银行', f2: 12.34, f3: 1.23, f4: 0.15 },
  ]}}};

  const mockFundResponse = {
    data: 'jsonpgz({"fundcode":"110011","name":"易方达中小盘","jzrq":"2026-05-14","dwjz":"4.6747","gsz":"4.6279","gszzl":"-1.00"})',
    status: 200, statusText: 'OK', headers: {}, config: {},
  };

  const mockKLineResponse = { data: { data: { klines: [
    '2026-05-14,12.20,12.34,12.50,12.10,100000,1230000',
  ]}}};

  beforeEach(async () => {
    http = { get: jest.fn() } as any;
    service = new MarketDataService(http);
  });

  describe('getStockQuotes', () => {
    it('should return stock quotes from East Money API', async () => {
      (http.get as jest.Mock).mockReturnValue(of(mockStockResponse));
      const result = await service.getStockQuotes(['000001', '600519']);
      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('000001');
      expect(result[0].price).toBe(12.34);
      expect(result[1].code).toBe('600519');
      expect(result[1].price).toBe(1850.00);
    });

    it('should return quotes for requested codes', async () => {
      (http.get as jest.Mock).mockReturnValue(of(mockStockResponse));
      const result = await service.getStockQuotes(['000001', '600519']);
      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('000001');
      expect(result[1].code).toBe('600519');
    });

    it('should fallback to DirectHttpProvider on failure', async () => {
      (http.get as jest.Mock)
        .mockReturnValueOnce(throwError(() => new Error('Connection refused')))
        .mockReturnValue(of({ data: 'var hq_str_sz000001="平安银行,12.20,12.19,12.34,12.50,12.10,100000,1230000,1.23";', status: 200, statusText: 'OK', headers: {}, config: {} }));
      const result = await service.getStockQuotes(['000001']);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('000001');
    });
  });

  describe('getFundNAVs', () => {
    it('should return fund NAVs from fundgz API', async () => {
      (http.get as jest.Mock).mockReturnValue(of(mockFundResponse));
      const result = await service.getFundNAVs(['110011']);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('110011');
      expect(result[0].nav).toBe(4.6747);
      expect(result[0].navDate).toBe('2026-05-14');
    });
  });

  describe('getKLine', () => {
    it('should return KLine data from East Money', async () => {
      (http.get as jest.Mock).mockReturnValue(of(mockKLineResponse));
      const result = await service.getKLine('000001', 'daily', 1);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2026-05-14');
      expect(result[0].close).toBe(12.34);
    });
  });
});
