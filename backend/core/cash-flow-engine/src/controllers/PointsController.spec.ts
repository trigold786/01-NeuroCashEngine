import { Test, TestingModule } from '@nestjs/testing';
import { PointsController } from './PointsController';
import { PointsService } from '../services/PointsService';

describe('PointsController', () => {
  let controller: PointsController;

  const mockPointsService = {
    getPoints: jest.fn(),
    getHistory: jest.fn(),
    generateReferralCode: jest.fn(),
    redeemReferralCode: jest.fn(),
    getReferralCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointsController],
      providers: [
        { provide: PointsService, useValue: mockPointsService },
      ],
    }).compile();

    controller = module.get<PointsController>(PointsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /points/balance', () => {
    it('should return points balance', async () => {
      mockPointsService.getPoints.mockResolvedValue({ balance: 200, totalEarned: 300, totalSpent: 100 });
      const result = await controller.getBalance({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data.balance).toBe(200);
    });
  });

  describe('GET /points/history', () => {
    it('should return points history', async () => {
      mockPointsService.getHistory.mockResolvedValue([{ recordId: 'r1', amount: 100, reason: 'referral', description: null, referralUserId: null, createdAt: new Date() }]);
      const result = await controller.getHistory({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('POST /points/referral/generate', () => {
    it('should generate referral code', async () => {
      mockPointsService.generateReferralCode.mockResolvedValue({ referralId: 'r1', code: 'ABC12345', usedCount: 0, isActive: true, createdAt: new Date() });
      const result = await controller.generateReferralCode({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data.code).toBe('ABC12345');
    });
  });

  describe('POST /points/referral/redeem', () => {
    it('should redeem referral code', async () => {
      const mockData = {
        referrer: { balance: 100, totalEarned: 100, totalSpent: 0 },
        newUser: { balance: 50, totalEarned: 50, totalSpent: 0 },
      };
      mockPointsService.redeemReferralCode.mockResolvedValue(mockData);
      const result = await controller.redeemReferralCode({ code: 'ABC123' }, { user: { id: 'u2' } });
      expect(result.success).toBe(true);
      expect(result.data.referrer.balance).toBe(100);
      expect(result.data.newUser.balance).toBe(50);
    });
  });

  describe('GET /points/referral/code', () => {
    it('should return referral code', async () => {
      mockPointsService.getReferralCode.mockResolvedValue({ referralId: 'r1', code: 'ABC12345', usedCount: 1, isActive: true, createdAt: new Date() });
      const result = await controller.getReferralCode({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data!.code).toBe('ABC12345');
    });

    it('should return null when no code', async () => {
      mockPointsService.getReferralCode.mockResolvedValue(null);
      const result = await controller.getReferralCode({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });
});
