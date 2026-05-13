import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './SubscriptionService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subscription } from '../entities/Subscription.entity';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const mockSubscriptionRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: getRepositoryToken(Subscription), useValue: mockSubscriptionRepository },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentPlan', () => {
    it('should return existing active plan', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue({
        subscriptionId: 's1', userId: 'u1', tier: 'premium', status: 'active',
        startDate: '2026-01-01', endDate: '2026-02-01', autoRenew: true, features: null,
      });
      const result = await service.getCurrentPlan('u1');
      expect(result.tier).toBe('premium');
    });

    it('should create free plan if none exists', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue({ userId: 'u1', tier: 'free', status: 'active', autoRenew: false });
      mockSubscriptionRepository.save.mockResolvedValue({
        subscriptionId: 's1', userId: 'u1', tier: 'free', status: 'active',
        startDate: '2026-05-13', endDate: null, autoRenew: false, features: null,
      });
      const result = await service.getCurrentPlan('u1');
      expect(result.tier).toBe('free');
    });
  });

  describe('upgrade', () => {
    it('should upgrade to premium', async () => {
      mockSubscriptionRepository.update.mockResolvedValue({ affected: 1 });
      mockSubscriptionRepository.create.mockReturnValue({ userId: 'u1', tier: 'premium', status: 'active', autoRenew: true });
      mockSubscriptionRepository.save.mockResolvedValue({
        subscriptionId: 's2', userId: 'u1', tier: 'premium', status: 'active',
        startDate: '2026-05-13', endDate: '2026-06-13', autoRenew: true, features: null,
      });
      const result = await service.upgrade('u1', 'premium');
      expect(result.tier).toBe('premium');
      expect(result.status).toBe('active');
    });

    it('should throw for invalid tier', async () => {
      await expect(service.upgrade('u1', 'invalid')).rejects.toThrow('Invalid tier');
    });
  });

  describe('cancel', () => {
    it('should cancel active subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue({
        subscriptionId: 's1', userId: 'u1', tier: 'premium', status: 'active',
      });
      mockSubscriptionRepository.save.mockResolvedValue({
        subscriptionId: 's1', userId: 'u1', tier: 'premium', status: 'cancelled',
      });
      const result = await service.cancel('u1');
      expect(result.status).toBe('cancelled');
    });

    it('should throw if no active subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      await expect(service.cancel('u1')).rejects.toThrow('No active subscription found');
    });
  });

  describe('getFeatureAccess', () => {
    it('should return true for free tier basic features', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue({
        subscriptionId: 's1', userId: 'u1', tier: 'free', status: 'active',
        startDate: '2026-01-01', endDate: null, autoRenew: false, features: null,
      });
      const result = await service.getFeatureAccess('u1', 'basic_asset_overview');
      expect(result).toBe(true);
    });

    it('should return false for premium features on free tier', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue({
        subscriptionId: 's1', userId: 'u1', tier: 'free', status: 'active',
        startDate: '2026-01-01', endDate: null, autoRenew: false, features: null,
      });
      const result = await service.getFeatureAccess('u1', 'api_access');
      expect(result).toBe(false);
    });
  });

  describe('getTiers', () => {
    it('should return all tier definitions', () => {
      const tiers = service.getTiers();
      expect(tiers).toHaveLength(3);
      expect(tiers[0].tier).toBe('free');
      expect(tiers[1].tier).toBe('premium');
      expect(tiers[2].tier).toBe('enterprise');
    });
  });
});
