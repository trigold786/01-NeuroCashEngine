import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface NSIUserProfile {
  userId: string;
  socialInsuranceStatus: 'active' | 'inactive' | 'partial';
  medicalInsuranceStatus: 'active' | 'inactive';
  pensionYears: number;
  monthlyContribution: number;
  coverageLevel: 'full' | 'basic' | 'minimum';
  riskProfileModifier: number;
}

export interface EnhancedRiskProfile {
  adjustedProfile: string;
  adjustmentReason: string;
}

export interface FinancialHealthScore {
  score: number;
  suggestions: string[];
}

const MOCK_PROFILES: Record<string, NSIUserProfile> = {
  'user-001': {
    userId: 'user-001',
    socialInsuranceStatus: 'active',
    medicalInsuranceStatus: 'active',
    pensionYears: 15,
    monthlyContribution: 3200,
    coverageLevel: 'full',
    riskProfileModifier: -1,
  },
  'user-002': {
    userId: 'user-002',
    socialInsuranceStatus: 'active',
    medicalInsuranceStatus: 'active',
    pensionYears: 3,
    monthlyContribution: 1800,
    coverageLevel: 'basic',
    riskProfileModifier: 0,
  },
  'user-003': {
    userId: 'user-003',
    socialInsuranceStatus: 'inactive',
    medicalInsuranceStatus: 'inactive',
    pensionYears: 0,
    monthlyContribution: 0,
    coverageLevel: 'minimum',
    riskProfileModifier: 2,
  },
  'user-004': {
    userId: 'user-004',
    socialInsuranceStatus: 'partial',
    medicalInsuranceStatus: 'active',
    pensionYears: 8,
    monthlyContribution: 1500,
    coverageLevel: 'basic',
    riskProfileModifier: 0,
  },
  'user-005': {
    userId: 'user-005',
    socialInsuranceStatus: 'active',
    medicalInsuranceStatus: 'active',
    pensionYears: 25,
    monthlyContribution: 5000,
    coverageLevel: 'full',
    riskProfileModifier: -2,
  },
};

const RISK_PROFILES = ['conservative', 'moderate', 'aggressive'];

@Injectable()
export class NSICoordinationService {
  private readonly logger = new Logger(NSICoordinationService.name);

  async getUserProfile(userId: string): Promise<NSIUserProfile> {
    const profile = MOCK_PROFILES[userId];
    if (!profile) {
      return {
        userId,
        socialInsuranceStatus: 'active',
        medicalInsuranceStatus: 'active',
        pensionYears: 10,
        monthlyContribution: 2500,
        coverageLevel: 'basic',
        riskProfileModifier: 0,
      };
    }
    this.logger.log(`Retrieved NSI profile for user ${userId}`);
    return profile;
  }

  async getEnhancedRiskProfile(userId: string, baseRiskProfile: string): Promise<EnhancedRiskProfile> {
    const profile = await this.getUserProfile(userId);
    const baseIndex = RISK_PROFILES.indexOf(baseRiskProfile);
    if (baseIndex === -1) {
      return { adjustedProfile: baseRiskProfile, adjustmentReason: 'Unknown base risk profile, no adjustment applied' };
    }

    const modifier = profile.riskProfileModifier;
    let adjustedIndex = Math.max(0, Math.min(RISK_PROFILES.length - 1, baseIndex + modifier));
    const adjustedProfile = RISK_PROFILES[adjustedIndex];

    let reason: string;
    if (profile.socialInsuranceStatus === 'active' && profile.coverageLevel === 'full') {
      reason = `社保缴纳状态良好（${profile.coverageLevel}级覆盖），风险偏好降低`;
    } else if (profile.socialInsuranceStatus === 'inactive' && profile.medicalInsuranceStatus === 'inactive') {
      reason = '无社保和医保覆盖，风险承受能力降低，建议更保守策略';
    } else if (profile.pensionYears < 5) {
      reason = `养老金缴纳年限较短（${profile.pensionYears}年），风险偏好提升以追求更高回报`;
    } else if (profile.pensionYears >= 20) {
      reason = `养老金缴纳充足（${profile.pensionYears}年），财务状况稳健`;
    } else {
      reason = `NSI风险评估调整：modifier ${modifier >= 0 ? '+' : ''}${modifier}`;
    }

    this.logger.log(`Enhanced risk profile for ${userId}: ${baseRiskProfile} -> ${adjustedProfile} (modifier: ${modifier})`);
    return { adjustedProfile, adjustmentReason: reason };
  }

  async getFinancialHealthScore(userId: string): Promise<FinancialHealthScore> {
    const profile = await this.getUserProfile(userId);
    const suggestions: string[] = [];

    let score = 60;

    if (profile.socialInsuranceStatus === 'active') {
      score += 15;
    } else if (profile.socialInsuranceStatus === 'partial') {
      score += 5;
    } else {
      score -= 15;
      suggestions.push('建议尽快参加社会保险，建立基本保障');
    }

    if (profile.medicalInsuranceStatus === 'active') {
      score += 10;
    } else {
      score -= 10;
      suggestions.push('医疗保障缺失，建议立即办理医疗保险');
    }

    if (profile.coverageLevel === 'full') {
      score += 10;
    } else if (profile.coverageLevel === 'basic') {
      score += 5;
    } else {
      score -= 5;
    }

    if (profile.pensionYears >= 20) {
      score += 10;
    } else if (profile.pensionYears >= 10) {
      score += 5;
    } else if (profile.pensionYears >= 5) {
      score += 2;
    } else {
      score -= 5;
      suggestions.push('养老金缴纳年限较短，建议增加养老储蓄');
    }

    if (profile.monthlyContribution >= 3000) {
      score += 5;
    } else if (profile.monthlyContribution < 1000 && profile.monthlyContribution > 0) {
      suggestions.push('月缴金额偏低，建议适当提高社保缴费基数');
    }

    score = Math.max(0, Math.min(100, score));

    if (suggestions.length === 0) {
      suggestions.push('您的社会保障状况良好，继续保持');
    }

    return { score, suggestions };
  }
}
