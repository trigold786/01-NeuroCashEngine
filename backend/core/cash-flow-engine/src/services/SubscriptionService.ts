import { Injectable, Logger, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/Subscription.entity';

export interface SubscriptionResponse {
  subscriptionId: string;
  tier: string;
  status: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  features: Record<string, any> | null;
}

export interface TierInfo {
  tier: string;
  name: string;
  price: number;
  features: string[];
}

const TIER_DEFINITIONS: Record<string, { name: string; price: number; features: string[] }> = {
  free: {
    name: '免费版',
    price: 0,
    features: ['basic_asset_overview', 'official_news'],
  },
  premium: {
    name: '高级版',
    price: 99,
    features: ['basic_asset_overview', 'official_news', 'verified_news', 'advanced_strategy'],
  },
  enterprise: {
    name: '企业版',
    price: 999,
    features: ['basic_asset_overview', 'official_news', 'verified_news', 'advanced_strategy', 'api_access', 'portfolio_monitoring', 'cash_flow_forecast'],
  },
};

@Injectable()
export class SubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async onModuleInit() {
    // no automatic seeding for subscriptions
  }

  async getCurrentPlan(userId: string): Promise<SubscriptionResponse> {
    let sub = await this.subscriptionRepository.findOne({
      where: { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });
    if (!sub) {
      // create default free tier
      sub = await this.subscriptionRepository.save(
        this.subscriptionRepository.create({
          userId,
          tier: 'free',
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          autoRenew: false,
        }),
      );
    }
    return this.toResponse(sub);
  }

  async upgrade(userId: string, tier: string): Promise<SubscriptionResponse> {
    if (!TIER_DEFINITIONS[tier]) {
      throw new BadRequestException(`Invalid tier: ${tier}. Valid tiers: ${Object.keys(TIER_DEFINITIONS).join(', ')}`);
    }

    // cancel existing active subscription
    await this.subscriptionRepository.update(
      { userId, status: 'active' },
      { status: 'cancelled' },
    );

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const sub = await this.subscriptionRepository.save(
      this.subscriptionRepository.create({
        userId,
        tier,
        status: 'active',
        startDate: now.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        autoRenew: true,
        features: null,
      }),
    );

    return this.toResponse(sub);
  }

  async cancel(userId: string): Promise<SubscriptionResponse> {
    const sub = await this.subscriptionRepository.findOne({
      where: { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });
    if (!sub) throw new BadRequestException('No active subscription found');

    sub.status = 'cancelled';
    await this.subscriptionRepository.save(sub);
    return this.toResponse(sub);
  }

  async getFeatureAccess(userId: string, featureKey: string): Promise<boolean> {
    const plan = await this.getCurrentPlan(userId);
    const tierDef = TIER_DEFINITIONS[plan.tier];
    if (!tierDef) return false;
    return tierDef.features.includes(featureKey);
  }

  getTiers(): TierInfo[] {
    return Object.entries(TIER_DEFINITIONS).map(([tier, def]) => ({
      tier,
      name: def.name,
      price: def.price,
      features: def.features,
    }));
  }

  private toResponse(s: Subscription): SubscriptionResponse {
    return {
      subscriptionId: s.subscriptionId,
      tier: s.tier,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      autoRenew: s.autoRenew,
      features: s.features,
    };
  }
}
