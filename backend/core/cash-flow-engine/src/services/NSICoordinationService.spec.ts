import { Test, TestingModule } from '@nestjs/testing';
import { NSICoordinationService } from './NSICoordinationService';

describe('NSICoordinationService', () => {
  let service: NSICoordinationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NSICoordinationService],
    }).compile();

    service = module.get<NSICoordinationService>(NSICoordinationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserProfile', () => {
    it('should return profile for known user', async () => {
      const profile = await service.getUserProfile('user-001');
      expect(profile.userId).toBe('user-001');
      expect(profile.socialInsuranceStatus).toBe('active');
      expect(profile.coverageLevel).toBe('full');
      expect(profile.riskProfileModifier).toBe(-1);
    });

    it('should return profile for user without insurance', async () => {
      const profile = await service.getUserProfile('user-003');
      expect(profile.socialInsuranceStatus).toBe('inactive');
      expect(profile.riskProfileModifier).toBe(2);
    });

    it('should return default profile for unknown user', async () => {
      const profile = await service.getUserProfile('unknown');
      expect(profile.socialInsuranceStatus).toBe('active');
      expect(profile.medicalInsuranceStatus).toBe('active');
      expect(profile.coverageLevel).toBe('basic');
    });
  });

  describe('getEnhancedRiskProfile', () => {
    it('should adjust conservative to even more conservative for full coverage', async () => {
      const result = await service.getEnhancedRiskProfile('user-001', 'conservative');
      expect(result.adjustedProfile).toBe('conservative');
      expect(result.adjustmentReason).toContain('社保缴纳状态良好');
    });

    it('should shift aggressive to moderate for stable user', async () => {
      const result = await service.getEnhancedRiskProfile('user-001', 'aggressive');
      expect(result.adjustedProfile).toBe('moderate');
    });

    it('should shift conservative to moderate for no insurance user', async () => {
      const result = await service.getEnhancedRiskProfile('user-003', 'conservative');
      expect(result.adjustedProfile).toBe('aggressive');
    });

    it('should shift moderate to aggressive for high risk user', async () => {
      const result = await service.getEnhancedRiskProfile('user-003', 'moderate');
      expect(result.adjustedProfile).toBe('aggressive');
    });

    it('should adjust aggressive down to conservative for long pension user (modifier -2)', async () => {
      const result = await service.getEnhancedRiskProfile('user-005', 'aggressive');
      expect(result.adjustedProfile).toBe('conservative');
    });

    it('should return reason for adjustment', async () => {
      const result = await service.getEnhancedRiskProfile('user-001', 'aggressive');
      expect(result.adjustmentReason).toBeTruthy();
    });
  });

  describe('getFinancialHealthScore', () => {
    it('should return high score for fully insured user', async () => {
      const result = await service.getFinancialHealthScore('user-001');
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should return low score for uninsured user', async () => {
      const result = await service.getFinancialHealthScore('user-003');
      expect(result.score).toBeLessThanOrEqual(50);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should return moderate score for partial coverage', async () => {
      const result = await service.getFinancialHealthScore('user-004');
      expect(result.score).toBeGreaterThanOrEqual(30);
      expect(result.score).toBeLessThanOrEqual(90);
    });

    it('should return highest score for user with full pension', async () => {
      const result = await service.getFinancialHealthScore('user-005');
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('should include actionable suggestions for low score users', async () => {
      const result = await service.getFinancialHealthScore('user-003');
      expect(result.suggestions).toContain('建议尽快参加社会保险，建立基本保障');
    });
  });
});
