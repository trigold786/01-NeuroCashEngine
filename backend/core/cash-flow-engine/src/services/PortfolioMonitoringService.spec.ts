import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioMonitoringService } from './PortfolioMonitoringService';

describe('PortfolioMonitoringService', () => {
  let service: PortfolioMonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioMonitoringService],
    }).compile();

    service = module.get<PortfolioMonitoringService>(PortfolioMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPortfolio', () => {
    it('should return summary and 6 holdings', () => {
      const result = service.getPortfolio('user-1');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('holdings');
      expect(result.holdings).toHaveLength(6);
    });

    it('should compute totalValue as sum of marketValue', () => {
      const result = service.getPortfolio('user-1');
      const totalMarketValue = result.holdings.reduce((s, h) => s + h.marketValue, 0);
      expect(result.summary.totalValue).toBe(totalMarketValue);
    });

    it('should include all required summary fields', () => {
      const result = service.getPortfolio('user-1');
      expect(result.summary).toHaveProperty('totalValue');
      expect(result.summary).toHaveProperty('totalCost');
      expect(result.summary).toHaveProperty('totalPnl');
      expect(result.summary).toHaveProperty('totalPnlPercent');
      expect(result.summary).toHaveProperty('dailyPnl');
      expect(result.summary).toHaveProperty('riskLevel');
      expect(result.summary).toHaveProperty('diversification');
    });

    it('should include all required holding fields', () => {
      const result = service.getPortfolio('user-1');
      const holding = result.holdings[0];
      expect(holding).toHaveProperty('productId');
      expect(holding).toHaveProperty('productName');
      expect(holding).toHaveProperty('type');
      expect(holding).toHaveProperty('shares');
      expect(holding).toHaveProperty('avgCost');
      expect(holding).toHaveProperty('currentPrice');
      expect(holding).toHaveProperty('marketValue');
      expect(holding).toHaveProperty('pnl');
      expect(holding).toHaveProperty('pnlPercent');
      expect(holding).toHaveProperty('allocation');
      expect(holding).toHaveProperty('targetAllocation');
      expect(holding).toHaveProperty('deviation');
    });

    it('should have valid type values', () => {
      const result = service.getPortfolio('user-1');
      const validTypes = ['CASH', 'DEPOSIT', 'FUND', 'STOCK', 'BOND'];
      result.holdings.forEach(h => {
        expect(validTypes).toContain(h.type);
      });
    });

    it('should return dailyPnl as a number', () => {
      const result = service.getPortfolio('user-1');
      expect(typeof result.summary.dailyPnl).toBe('number');
    });
  });

  describe('getAlerts', () => {
    it('should return 5 alerts', () => {
      const alerts = service.getAlerts('user-1');
      expect(alerts).toHaveLength(5);
    });

    it('should include all required alert fields', () => {
      const alerts = service.getAlerts('user-1');
      alerts.forEach(a => {
        expect(a).toHaveProperty('id');
        expect(a).toHaveProperty('type');
        expect(a).toHaveProperty('severity');
        expect(a).toHaveProperty('title');
        expect(a).toHaveProperty('description');
        expect(a).toHaveProperty('createdAt');
        expect(a).toHaveProperty('acknowledged');
      });
    });

    it('should have valid severity values', () => {
      const alerts = service.getAlerts('user-1');
      const validSeverities = ['info', 'warning', 'critical'];
      alerts.forEach(a => {
        expect(validSeverities).toContain(a.severity);
      });
    });
  });

  describe('acknowledgeAlert', () => {
    it('should return success', () => {
      const result = service.acknowledgeAlert('user-1', 'ALT-001');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getPerformance', () => {
    it('should return performance data for given period', () => {
      const result = service.getPerformance('user-1', '1m');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return performance entries with date, value and pnl', () => {
      const result = service.getPerformance('user-1', '1m');
      result.forEach(p => {
        expect(p).toHaveProperty('date');
        expect(p).toHaveProperty('value');
        expect(p).toHaveProperty('pnl');
      });
    });

    it('should return 31 entries for 1 month (30 days + today)', () => {
      const result = service.getPerformance('user-1', '1m');
      expect(result.length).toBe(31);
    });

    it('should return 366 entries for 1 year', () => {
      const result = service.getPerformance('user-1', '1y');
      expect(result.length).toBe(366);
    });
  });
});
