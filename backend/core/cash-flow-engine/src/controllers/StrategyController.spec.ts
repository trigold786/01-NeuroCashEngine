import { Test, TestingModule } from '@nestjs/testing';
import { StrategyController } from './StrategyController';
import { StrategyService } from '../services/StrategyService';

describe('StrategyController', () => {
  let controller: StrategyController;
  let service: StrategyService;

  const mockStrategyService = {
    generateRecommendation: jest.fn(),
    getProductsByRiskLevel: jest.fn(),
    calculateRiskProfile: jest.fn(),
    calculateRiskScore: jest.fn(),
    getStrategyByRiskProfile: jest.fn(),
    getTradingPlan: jest.fn(),
    getFundamentalAnalysis: jest.fn(),
    getTechnicalAnalysis: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StrategyController],
      providers: [
        {
          provide: StrategyService,
          useValue: mockStrategyService,
        },
      ],
    }).compile();

    controller = module.get<StrategyController>(StrategyController);
    service = module.get<StrategyService>(StrategyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecommendation', () => {
    it('should return recommendation based on risk profile', async () => {
      const mockRecommendation = {
        riskProfile: 'moderate',
        allocation: { CASH: 10, DEPOSIT: 30, FUND: 40, STOCK: 20, BOND: 0, GOLD: 0, FUTURES: 0, REITS: 0 },
        riskLevel: 2,
      };
      mockStrategyService.generateRecommendation.mockResolvedValue(mockRecommendation);

      const result = await controller.getRecommendation({ riskProfile: 'moderate' });

      expect(mockStrategyService.generateRecommendation).toHaveBeenCalledWith('moderate');
      expect(result).toEqual(mockRecommendation);
    });

    it('should default to conservative for missing risk profile', async () => {
      const mockRecommendation = {
        riskProfile: 'conservative',
        allocation: { CASH: 20, DEPOSIT: 50, FUND: 20, STOCK: 10, BOND: 0, GOLD: 0, FUTURES: 0, REITS: 0 },
        riskLevel: 1,
      };
      mockStrategyService.generateRecommendation.mockResolvedValue(mockRecommendation);

      const result = await controller.getRecommendation({});

      expect(mockStrategyService.generateRecommendation).toHaveBeenCalledWith('conservative');
      expect(result).toEqual(mockRecommendation);
    });
  });

  describe('getProducts', () => {
    it('should return products for given risk level', async () => {
      const mockProducts = [
        { id: 'P-001', name: 'Product 1', type: 'FUND', expectedReturn: 5.0, riskLevel: 2 },
        { id: 'P-002', name: 'Product 2', type: 'FUND', expectedReturn: 4.5, riskLevel: 2 },
      ];
      mockStrategyService.getProductsByRiskLevel.mockResolvedValue(mockProducts);

      const result = await controller.getProducts('moderate');

      expect(mockStrategyService.getProductsByRiskLevel).toHaveBeenCalledWith('moderate');
      expect(result).toEqual(mockProducts);
    });

    it('should default to conservative for missing risk level', async () => {
      const mockProducts = [
        { id: 'P-001', name: 'Product 1', type: 'CASH', expectedReturn: 2.0, riskLevel: 1 },
      ];
      mockStrategyService.getProductsByRiskLevel.mockResolvedValue(mockProducts);

      const result = await controller.getProducts('');

      expect(mockStrategyService.getProductsByRiskLevel).toHaveBeenCalledWith('conservative');
      expect(result).toEqual(mockProducts);
    });
  });

  describe('calculateRiskScore', () => {
    it('should delegate to service for risk score calculation', async () => {
      mockStrategyService.calculateRiskScore.mockResolvedValue({ riskProfile: 'moderate', score: 10 });

      const answers = {
        q1: 'B',
        q2: 'C',
        q3: 'B',
        q4: 'A',
        q5: 'B',
      };

      const result = await controller.calculateRiskScore(answers);

      expect(mockStrategyService.calculateRiskScore).toHaveBeenCalledWith(answers);
      expect(result).toEqual({ riskProfile: 'moderate', score: 10 });
    });

    it('should return conservative for edge case score', async () => {
      mockStrategyService.calculateRiskScore.mockResolvedValue({ riskProfile: 'conservative', score: 5 });

      const answers = {
        q1: 'A',
        q2: 'A',
        q3: 'A',
        q4: 'A',
        q5: 'A',
      };

      const result = await controller.calculateRiskScore(answers);

      expect(mockStrategyService.calculateRiskScore).toHaveBeenCalledWith(answers);
      expect(result).toEqual({ riskProfile: 'conservative', score: 5 });
    });
  });

  describe('getStrategy', () => {
    it('should return strategy for given risk profile', async () => {
      const mockStrategy = {
        entryTiming: '建议分3批建仓',
        holdingPeriod: '建议持有6-12个月',
        stopProfitLevel: '达到15%收益时分批止盈',
        stopLossLevel: '亏损超过8%时止损',
        riskMgmtAdvice: '单一标的不超过总资产20%',
        capitalMgmtAdvice: '保留30%流动资金',
      };
      mockStrategyService.getStrategyByRiskProfile.mockResolvedValue(mockStrategy);

      const result = await controller.getStrategy('moderate');

      expect(mockStrategyService.getStrategyByRiskProfile).toHaveBeenCalledWith('moderate');
      expect(result).toEqual(mockStrategy);
    });

    it('should default to conservative for missing risk profile', async () => {
      const mockStrategy = {
        entryTiming: '建议一次性建仓',
        holdingPeriod: '建议持有12-24个月',
        stopProfitLevel: '达到8%收益时分批止盈',
        stopLossLevel: '亏损超过5%时止损',
        riskMgmtAdvice: '单一标的不超过总资产30%',
        capitalMgmtAdvice: '保留40%流动资金',
      };
      mockStrategyService.getStrategyByRiskProfile.mockResolvedValue(mockStrategy);

      const result = await controller.getStrategy(undefined);

      expect(mockStrategyService.getStrategyByRiskProfile).toHaveBeenCalledWith('conservative');
      expect(result).toEqual(mockStrategy);
    });
  });

  describe('getTradingPlan', () => {
    it('should return trading plan for given risk profile and amount', async () => {
      const mockPlan = ['第1批：投入¥50000购买货币基金', '第2批：1周后投入¥50000购买国债'];
      mockStrategyService.getTradingPlan.mockResolvedValue(mockPlan);

      const result = await controller.getTradingPlan({ riskProfile: 'conservative', amount: 100000 });

      expect(mockStrategyService.getTradingPlan).toHaveBeenCalledWith('conservative', 100000);
      expect(result).toEqual(mockPlan);
    });

    it('should default to conservative and 100000 for missing params', async () => {
      const mockPlan = ['第1批：投入¥50000购买货币基金'];
      mockStrategyService.getTradingPlan.mockResolvedValue(mockPlan);

      const result = await controller.getTradingPlan({});

      expect(mockStrategyService.getTradingPlan).toHaveBeenCalledWith('conservative', 100000);
      expect(result).toEqual(mockPlan);
    });
  });

  describe('getFundamentalAnalysis', () => {
    it('should return fundamental data for given product', async () => {
      const mockAnalysis = { pe: 15, pb: 2.5, roe: 12.0, revenueGrowth: 15.0 };
      mockStrategyService.getFundamentalAnalysis.mockResolvedValue(mockAnalysis);

      const result = await controller.getFundamentalAnalysis('P-MOD-001');

      expect(mockStrategyService.getFundamentalAnalysis).toHaveBeenCalledWith('P-MOD-001');
      expect(result).toEqual(mockAnalysis);
    });

    it('should default productId for missing param', async () => {
      const mockAnalysis = { pe: 10, pb: 1.5, roe: 8.0, revenueGrowth: 10.0 };
      mockStrategyService.getFundamentalAnalysis.mockResolvedValue(mockAnalysis);

      const result = await controller.getFundamentalAnalysis(undefined);

      expect(mockStrategyService.getFundamentalAnalysis).toHaveBeenCalledWith('P-MOD-001');
      expect(result).toEqual(mockAnalysis);
    });
  });

  describe('getTechnicalAnalysis', () => {
    it('should return technical data for given stock', async () => {
      const mockAnalysis = { trend: '上升通道', support: 1600, resistance: 2000, rsi: 62 };
      mockStrategyService.getTechnicalAnalysis.mockResolvedValue(mockAnalysis);

      const result = await controller.getTechnicalAnalysis('600519');

      expect(mockStrategyService.getTechnicalAnalysis).toHaveBeenCalledWith('600519');
      expect(result).toEqual(mockAnalysis);
    });

    it('should default stockCode for missing param', async () => {
      const mockAnalysis = { trend: '横盘震荡', support: 0, resistance: 0, rsi: 50 };
      mockStrategyService.getTechnicalAnalysis.mockResolvedValue(mockAnalysis);

      const result = await controller.getTechnicalAnalysis(undefined);

      expect(mockStrategyService.getTechnicalAnalysis).toHaveBeenCalledWith('600519');
      expect(result).toEqual(mockAnalysis);
    });
  });
});
