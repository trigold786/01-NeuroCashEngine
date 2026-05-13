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
        allocation: { CASH: 10, DEPOSIT: 30, FUND: 40, STOCK: 20 },
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
        allocation: { CASH: 20, DEPOSIT: 50, FUND: 20, STOCK: 10 },
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
});
