import { Test, TestingModule } from '@nestjs/testing';
import { PointsService } from './PointsService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Points } from '../entities/Points.entity';
import { PointsRecord } from '../entities/PointsRecord.entity';
import { ReferralCode } from '../entities/ReferralCode.entity';

describe('PointsService', () => {
  let service: PointsService;

  const mockPointsRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockRecordRepository = {
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockReferralRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsService,
        { provide: getRepositoryToken(Points), useValue: mockPointsRepository },
        { provide: getRepositoryToken(PointsRecord), useValue: mockRecordRepository },
        { provide: getRepositoryToken(ReferralCode), useValue: mockReferralRepository },
      ],
    }).compile();

    service = module.get<PointsService>(PointsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPoints', () => {
    it('should return existing points balance', async () => {
      mockPointsRepository.findOne.mockResolvedValue({ userId: 'u1', balance: 200, totalEarned: 300, totalSpent: 100 });
      const result = await service.getPoints('u1');
      expect(result.balance).toBe(200);
      expect(result.totalEarned).toBe(300);
      expect(result.totalSpent).toBe(100);
    });

    it('should create new points record if none exists', async () => {
      mockPointsRepository.findOne.mockResolvedValue(null);
      mockPointsRepository.create.mockReturnValue({ userId: 'u1', balance: 0, totalEarned: 0, totalSpent: 0 });
      mockPointsRepository.save.mockResolvedValue({ userId: 'u1', balance: 0, totalEarned: 0, totalSpent: 0 });
      const result = await service.getPoints('u1');
      expect(result.balance).toBe(0);
      expect(result.totalEarned).toBe(0);
      expect(result.totalSpent).toBe(0);
    });
  });

  describe('getHistory', () => {
    it('should return records in descending order', async () => {
      const mockRecords = [
        { recordId: 'r1', userId: 'u1', amount: 100, reason: 'referral', description: 'test', referralUserId: null, createdAt: new Date('2026-05-13') },
        { recordId: 'r2', userId: 'u1', amount: -50, reason: 'redeem', description: null, referralUserId: null, createdAt: new Date('2026-05-12') },
      ];
      mockRecordRepository.find.mockResolvedValue(mockRecords);
      const result = await service.getHistory('u1');
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(100);
      expect(result[1].reason).toBe('redeem');
    });
  });

  describe('addPoints', () => {
    it('should add points and create record', async () => {
      mockPointsRepository.findOne.mockResolvedValue({ userId: 'u1', balance: 100, totalEarned: 200, totalSpent: 50 });
      mockPointsRepository.save.mockResolvedValue({ userId: 'u1', balance: 150, totalEarned: 250, totalSpent: 50 });
      mockRecordRepository.create.mockReturnValue({ userId: 'u1', amount: 50, reason: 'referral' });
      mockRecordRepository.save.mockResolvedValue({});

      const result = await service.addPoints('u1', 50, 'referral', 'bonus');
      expect(result.balance).toBe(150);
      expect(result.totalEarned).toBe(250);
    });

    it('should reject non-positive amount', async () => {
      await expect(service.addPoints('u1', -10, 'referral')).rejects.toThrow('Amount must be positive');
    });
  });

  describe('deductPoints', () => {
    it('should deduct points', async () => {
      mockPointsRepository.findOne.mockResolvedValue({ userId: 'u1', balance: 100, totalEarned: 200, totalSpent: 50 });
      mockPointsRepository.save.mockResolvedValue({ userId: 'u1', balance: 50, totalEarned: 200, totalSpent: 100 });
      mockRecordRepository.create.mockReturnValue({ userId: 'u1', amount: -50, reason: 'redeem' });
      mockRecordRepository.save.mockResolvedValue({});

      const result = await service.deductPoints('u1', 50, 'redeem');
      expect(result.balance).toBe(50);
      expect(result.totalSpent).toBe(100);
    });

    it('should reject when insufficient balance', async () => {
      mockPointsRepository.findOne.mockResolvedValue({ userId: 'u1', balance: 10, totalEarned: 10, totalSpent: 0 });
      await expect(service.deductPoints('u1', 50, 'redeem')).rejects.toThrow('Insufficient points');
    });
  });

  describe('generateReferralCode', () => {
    it('should return existing code if already exists', async () => {
      mockReferralRepository.findOne.mockResolvedValue({ referralId: 'r1', userId: 'u1', code: 'ABC12345', usedCount: 2, isActive: true, createdAt: new Date() });
      const result = await service.generateReferralCode('u1');
      expect(result.code).toBe('ABC12345');
      expect(mockReferralRepository.save).not.toHaveBeenCalled();
    });

    it('should generate new code if none exists', async () => {
      mockReferralRepository.findOne.mockResolvedValue(null);
      mockReferralRepository.create.mockReturnValue({ userId: 'u1', code: 'XYZ98765', usedCount: 0, isActive: true });
      mockReferralRepository.save.mockResolvedValue({ referralId: 'r2', userId: 'u1', code: 'XYZ98765', usedCount: 0, isActive: true, createdAt: new Date() });
      const result = await service.generateReferralCode('u1');
      expect(result.code).toBe('XYZ98765');
      expect(result.code).toHaveLength(8);
    });
  });

  describe('redeemReferralCode', () => {
    it('should give points to both users when redeeming', async () => {
      mockReferralRepository.findOne.mockResolvedValue({ referralId: 'r1', userId: 'referrer1', code: 'ABC123', usedCount: 0, isActive: true });
      mockPointsRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPointsRepository.create.mockImplementation((data: any) => ({ ...data, balance: 0, totalEarned: 0, totalSpent: 0 }));
      mockPointsRepository.save
        .mockResolvedValueOnce({ userId: 'referrer1', balance: 100, totalEarned: 100, totalSpent: 0 })
        .mockResolvedValueOnce({ userId: 'newuser1', balance: 50, totalEarned: 50, totalSpent: 0 });
      mockRecordRepository.create.mockReturnValue({});
      mockRecordRepository.save.mockResolvedValue({});
      mockReferralRepository.save.mockResolvedValue({});

      const result = await service.redeemReferralCode('ABC123', 'newuser1');
      expect(result.referrer.balance).toBe(100);
      expect(result.newUser.balance).toBe(50);
    });

    it('should reject own code redemption', async () => {
      mockReferralRepository.findOne.mockResolvedValue({ referralId: 'r1', userId: 'u1', code: 'ABC123', isActive: true });
      await expect(service.redeemReferralCode('ABC123', 'u1')).rejects.toThrow('Cannot redeem your own referral code');
    });

    it('should reject inactive code', async () => {
      mockReferralRepository.findOne.mockResolvedValue(null);
      await expect(service.redeemReferralCode('INVALID', 'u2')).rejects.toThrow('Invalid or inactive referral code');
    });
  });

  describe('getReferralCode', () => {
    it('should return referral code', async () => {
      mockReferralRepository.findOne.mockResolvedValue({ referralId: 'r1', userId: 'u1', code: 'ABC123', usedCount: 1, isActive: true, createdAt: new Date() });
      const result = await service.getReferralCode('u1');
      expect(result).not.toBeNull();
      expect(result!.code).toBe('ABC123');
    });

    it('should return null if no code', async () => {
      mockReferralRepository.findOne.mockResolvedValue(null);
      const result = await service.getReferralCode('u1');
      expect(result).toBeNull();
    });
  });
});
