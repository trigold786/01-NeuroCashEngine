import { Test, TestingModule } from '@nestjs/testing';
import { NSICoordinationController } from './NSICoordinationController';
import { NSICoordinationService } from '../services/NSICoordinationService';

describe('NSICoordinationController', () => {
  let controller: NSICoordinationController;

  const mockNSIService = {
    getUserProfile: jest.fn(),
    getEnhancedRiskProfile: jest.fn(),
    getFinancialHealthScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NSICoordinationController],
      providers: [
        { provide: NSICoordinationService, useValue: mockNSIService },
      ],
    }).compile();

    controller = module.get<NSICoordinationController>(NSICoordinationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /nsi/profile', () => {
    it('should return profile for given userId', async () => {
      const mockProfile = {
        userId: 'user-001',
        socialInsuranceStatus: 'active',
        medicalInsuranceStatus: 'active',
        pensionYears: 15,
        monthlyContribution: 3200,
        coverageLevel: 'full',
        riskProfileModifier: -1,
      };
      mockNSIService.getUserProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile('user-001');
      expect(result.success).toBe(true);
      expect(result.data.userId).toBe('user-001');
      expect(mockNSIService.getUserProfile).toHaveBeenCalledWith('user-001');
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.getProfile(undefined)).rejects.toThrow();
    });
  });

  describe('GET /nsi/enhanced-risk', () => {
    it('should return enhanced risk profile', async () => {
      const mockEnhanced = {
        adjustedProfile: 'moderate',
        adjustmentReason: '社保状态良好',
      };
      mockNSIService.getEnhancedRiskProfile.mockResolvedValue(mockEnhanced);

      const result = await controller.getEnhancedRisk('user-001', 'aggressive');
      expect(result.success).toBe(true);
      expect(result.data.adjustedProfile).toBe('moderate');
      expect(mockNSIService.getEnhancedRiskProfile).toHaveBeenCalledWith('user-001', 'aggressive');
    });

    it('should throw when params missing', async () => {
      await expect(controller.getEnhancedRisk(undefined, 'conservative')).rejects.toThrow();
      await expect(controller.getEnhancedRisk('user-001', undefined)).rejects.toThrow();
    });

    it('should throw for invalid risk profile', async () => {
      await expect(controller.getEnhancedRisk('user-001', 'invalid')).rejects.toThrow();
    });
  });

  describe('GET /nsi/financial-health', () => {
    it('should return financial health score', async () => {
      const mockHealth = {
        score: 85,
        suggestions: ['您的社会保障状况良好'],
      };
      mockNSIService.getFinancialHealthScore.mockResolvedValue(mockHealth);

      const result = await controller.getFinancialHealth('user-001');
      expect(result.success).toBe(true);
      expect(result.data.score).toBe(85);
      expect(mockNSIService.getFinancialHealthScore).toHaveBeenCalledWith('user-001');
    });

    it('should throw when userId missing', async () => {
      await expect(controller.getFinancialHealth(undefined)).rejects.toThrow();
    });
  });
});
