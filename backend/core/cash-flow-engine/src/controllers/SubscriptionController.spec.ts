import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './SubscriptionController';
import { SubscriptionService } from '../services/SubscriptionService';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;

  const mockSubscriptionService = {
    getCurrentPlan: jest.fn(),
    getTiers: jest.fn(),
    upgrade: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        { provide: SubscriptionService, useValue: mockSubscriptionService },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /subscription/plan', () => {
    it('should return current plan and available tiers', async () => {
      mockSubscriptionService.getCurrentPlan.mockResolvedValue({ tier: 'free', status: 'active' });
      mockSubscriptionService.getTiers.mockReturnValue([{ tier: 'free', name: '免费版', price: 0, features: [] }]);
      const result = await controller.getPlan({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data.tier).toBe('free');
      expect(result.availableTiers).toHaveLength(1);
    });
  });

  describe('POST /subscription/upgrade', () => {
    it('should upgrade subscription', async () => {
      mockSubscriptionService.upgrade.mockResolvedValue({ tier: 'premium', status: 'active' });
      const result = await controller.upgrade({ tier: 'premium' }, { user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data.tier).toBe('premium');
    });
  });

  describe('POST /subscription/cancel', () => {
    it('should cancel subscription', async () => {
      mockSubscriptionService.cancel.mockResolvedValue({ tier: 'free', status: 'cancelled' });
      const result = await controller.cancel({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
    });
  });

  describe('GET /subscription/features', () => {
    it('should return features', async () => {
      mockSubscriptionService.getCurrentPlan.mockResolvedValue({ tier: 'free', status: 'active' });
      mockSubscriptionService.getTiers.mockReturnValue([]);
      const result = await controller.getFeatures({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
    });
  });
});
