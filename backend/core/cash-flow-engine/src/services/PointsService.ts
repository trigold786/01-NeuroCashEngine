import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Points } from '../entities/Points.entity';
import { PointsRecord } from '../entities/PointsRecord.entity';
import { ReferralCode } from '../entities/ReferralCode.entity';
import * as crypto from 'crypto';

export interface PointsBalanceResponse {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface PointsHistoryResponse {
  recordId: string;
  amount: number;
  reason: string;
  description: string | null;
  referralUserId: string | null;
  createdAt: Date;
}

export interface ReferralCodeResponse {
  referralId: string;
  code: string;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    @InjectRepository(Points)
    private readonly pointsRepository: Repository<Points>,
    @InjectRepository(PointsRecord)
    private readonly recordRepository: Repository<PointsRecord>,
    @InjectRepository(ReferralCode)
    private readonly referralRepository: Repository<ReferralCode>,
  ) {}

  async getPoints(userId: string): Promise<PointsBalanceResponse> {
    let points = await this.pointsRepository.findOne({ where: { userId } });
    if (!points) {
      points = await this.pointsRepository.save(
        this.pointsRepository.create({ userId, balance: 0, totalEarned: 0, totalSpent: 0 }),
      );
    }
    return { balance: points.balance, totalEarned: points.totalEarned, totalSpent: points.totalSpent };
  }

  async getHistory(userId: string): Promise<PointsHistoryResponse[]> {
    const records = await this.recordRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return records.map(r => ({
      recordId: r.recordId,
      amount: r.amount,
      reason: r.reason,
      description: r.description,
      referralUserId: r.referralUserId,
      createdAt: r.createdAt,
    }));
  }

  async addPoints(userId: string, amount: number, reason: string, description?: string, referralUserId?: string): Promise<PointsBalanceResponse> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    let points = await this.pointsRepository.findOne({ where: { userId } });
    if (!points) {
      points = this.pointsRepository.create({ userId, balance: 0, totalEarned: 0, totalSpent: 0 });
    }

    points.balance += amount;
    points.totalEarned += amount;
    await this.pointsRepository.save(points);

    await this.recordRepository.save(
      this.recordRepository.create({ userId, amount, reason, description, referralUserId }),
    );

    return { balance: points.balance, totalEarned: points.totalEarned, totalSpent: points.totalSpent };
  }

  async deductPoints(userId: string, amount: number, reason: string): Promise<PointsBalanceResponse> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    let points = await this.pointsRepository.findOne({ where: { userId } });
    if (!points) throw new BadRequestException('Insufficient points');
    if (points.balance < amount) throw new BadRequestException('Insufficient points');

    points.balance -= amount;
    points.totalSpent += amount;
    await this.pointsRepository.save(points);

    await this.recordRepository.save(
      this.recordRepository.create({ userId, amount: -amount, reason, description: undefined, referralUserId: undefined }),
    );

    return { balance: points.balance, totalEarned: points.totalEarned, totalSpent: points.totalSpent };
  }

  async generateReferralCode(userId: string): Promise<ReferralCodeResponse> {
    const existing = await this.referralRepository.findOne({ where: { userId, isActive: true } });
    if (existing) {
      return { referralId: existing.referralId, code: existing.code, usedCount: existing.usedCount, isActive: existing.isActive, createdAt: existing.createdAt };
    }

    const code = this.generateCode(8);
    const referral = await this.referralRepository.save(
      this.referralRepository.create({ userId, code, usedCount: 0, isActive: true }),
    );
    return { referralId: referral.referralId, code: referral.code, usedCount: referral.usedCount, isActive: referral.isActive, createdAt: referral.createdAt };
  }

  async redeemReferralCode(code: string, newUserId: string): Promise<{ referrer: PointsBalanceResponse; newUser: PointsBalanceResponse }> {
    const referral = await this.referralRepository.findOne({ where: { code, isActive: true } });
    if (!referral) throw new NotFoundException('Invalid or inactive referral code');
    if (referral.userId === newUserId) throw new BadRequestException('Cannot redeem your own referral code');

    const referrerPoints = await this.addPoints(referral.userId, 100, 'referral', `推荐新用户奖励`, newUserId);
    const newUserPoints = await this.addPoints(newUserId, 50, 'referral', '新用户注册奖励', referral.userId);

    referral.usedCount += 1;
    await this.referralRepository.save(referral);

    return { referrer: referrerPoints, newUser: newUserPoints };
  }

  async getReferralCode(userId: string): Promise<ReferralCodeResponse | null> {
    const referral = await this.referralRepository.findOne({ where: { userId, isActive: true } });
    if (!referral) return null;
    return { referralId: referral.referralId, code: referral.code, usedCount: referral.usedCount, isActive: referral.isActive, createdAt: referral.createdAt };
  }

  private generateCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }
}
