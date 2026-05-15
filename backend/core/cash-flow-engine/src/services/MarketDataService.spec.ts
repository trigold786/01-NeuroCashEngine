import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataService } from './MarketDataService';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('MarketDataService', () => {
  let service: MarketDataService;
  let http: HttpService;

  const mockAktoolsResponse = [
    { '代码': '000001', '名称': '平安银行', '最新价': 12.34, '涨跌幅': 1.23, '涨跌额': 0.15, '最高': 12.50, '最低': 12.10, '今开': 12.20, '昨收': 12.19, '成交量': 100000, '成交额': 1230000 },
    { '代码': '600519', '名称': '贵州茅台', '最新价': 1850.00, '涨跌幅': -0.50, '涨跌额': -9.25, '最高': 1860.00, '最低': 1840.00, '今开': 1855.00, '昨收': 1859.25, '成交量': 50000, '成交额': 92500000 },
  ];

  beforeEach(async () => {
    http = { get: jest.fn() } as any;
    service = new MarketDataService(http);
  });

  describe('getStockQuotes', () => {
    it('should return stock quotes from AKTools provider', async () => {
      (http.get as jest.Mock).mockReturnValue(of({ data: mockAktoolsResponse, status: 200, statusText: 'OK', headers: {}, config: {} }));
      const result = await service.getStockQuotes(['000001', '600519']);
      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('000001');
      expect(result[0].price).toBe(12.34);
      expect(result[1].code).toBe('600519');
      expect(result[1].price).toBe(1850.00);
    });

    it('should filter only requested codes', async () => {
      (http.get as jest.Mock).mockReturnValue(of({ data: mockAktoolsResponse, status: 200, statusText: 'OK', headers: {}, config: {} }));
      const result = await service.getStockQuotes(['000001']);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('000001');
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
    it('should return fund NAVs from AKTools', async () => {
      (http.get as jest.Mock).mockReturnValue(of({ data: [{ '基金代码': '110011', '基金简称': '易方达中小盘', '单位净值': 5.1234, '累计净值': 6.2345, '净值日期': '2026-05-14', '日增长率': 0.56 }], status: 200, statusText: 'OK', headers: {}, config: {} }));
      const result = await service.getFundNAVs(['110011']);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('110011');
      expect(result[0].nav).toBe(5.1234);
      expect(result[0].navDate).toBe('2026-05-14');
    });
  });

  describe('getKLine', () => {
    it('should return KLine data', async () => {
      (http.get as jest.Mock).mockReturnValue(of({ data: [{ '日期': '2026-05-14', '开盘': 12.20, '收盘': 12.34, '最高': 12.50, '最低': 12.10, '成交量': 100000, '成交额': 1230000 }], status: 200, statusText: 'OK', headers: {}, config: {} }));
      const result = await service.getKLine('000001', 'daily', 1);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2026-05-14');
      expect(result[0].close).toBe(12.34);
    });
  });
});
