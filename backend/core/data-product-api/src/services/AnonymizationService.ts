import { Injectable, Logger } from '@nestjs/common';

export interface AnonymizedResult {
  records: any[];
  suppressedCount: number;
  groupsFormed: number;
}

export interface DiversityResult {
  records: any[];
  groupsViolating: number;
  totalGroups: number;
}

export interface GeneralizationOptions {
  age?: string;
  income?: string;
  region?: string;
}

@Injectable()
export class AnonymizationService {
  private readonly logger = new Logger(AnonymizationService.name);

  anonymizeKAnonymity(data: any[], quasiIdentifiers: string[], k: number): AnonymizedResult {
    const groups = new Map<string, any[]>();

    for (const record of data) {
      const key = quasiIdentifiers.map(qi => String(record[qi] ?? '')).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    }

    const result: any[] = [];
    let suppressedCount = 0;

    for (const [, group] of groups) {
      if (group.length >= k) {
        result.push(...group);
      } else {
        suppressedCount += group.length;
      }
    }

    this.logger.log(`k-anonymity (k=${k}): ${result.length} records kept, ${suppressedCount} suppressed, ${groups.size} groups`);
    return { records: result, suppressedCount, groupsFormed: groups.size };
  }

  anonymizeLDiversity(data: any[], quasiIdentifiers: string[], sensitiveAttr: string, l: number): DiversityResult {
    const groups = new Map<string, any[]>();

    for (const record of data) {
      const key = quasiIdentifiers.map(qi => String(record[qi] ?? '')).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    }

    let groupsViolating = 0;

    for (const [, group] of groups) {
      const distinctValues = new Set(group.map(r => r[sensitiveAttr]));
      if (distinctValues.size < l) {
        groupsViolating++;
      }
    }

    const result = data;
    this.logger.log(`l-diversity (l=${l}): ${groupsViolating}/${groups.size} groups violate diversity requirement`);
    return { records: result, groupsViolating, totalGroups: groups.size };
  }

  addDifferentialPrivacy(value: number, epsilon: number, sensitivity: number): number {
    if (epsilon <= 0) {
      throw new Error('Epsilon must be positive');
    }

    const scale = sensitivity / epsilon;
    const u1 = Math.random();
    const u2 = Math.random();
    const laplaceNoise = scale * Math.log(u1 / u2);

    const noisyValue = value + laplaceNoise;

    this.logger.log(`DP noise added: value=${value}, epsilon=${epsilon}, noise=${laplaceNoise.toFixed(4)}, result=${noisyValue.toFixed(4)}`);
    return Math.round(noisyValue * 100) / 100;
  }

  generalizeValue(value: string | number, type: 'age' | 'income' | 'region'): string {
    switch (type) {
      case 'age': {
        const age = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(age)) return 'unknown';
        if (age < 18) return '0-17';
        if (age <= 25) return '18-25';
        if (age <= 35) return '26-35';
        if (age <= 45) return '36-45';
        if (age <= 55) return '46-55';
        if (age <= 65) return '56-65';
        return '65+';
      }
      case 'income': {
        const income = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(income)) return 'unknown';
        if (income < 30000) return '0-29,999';
        if (income <= 60000) return '30,000-59,999';
        if (income <= 100000) return '60,000-99,999';
        if (income <= 200000) return '100,000-199,999';
        return '200,000+';
      }
      case 'region': {
        const region = String(value);
        const regionGroups: Record<string, string> = {
          '北京': '华北', '天津': '华北', '石家庄': '华北', '太原': '华北',
          '上海': '华东', '南京': '华东', '杭州': '华东', '苏州': '华东', '合肥': '华东',
          '广州': '华南', '深圳': '华南', '东莞': '华南', '佛山': '华南',
          '成都': '西南', '重庆': '西南', '昆明': '西南',
          '武汉': '华中', '长沙': '华中', '郑州': '华中',
          '西安': '西北', '兰州': '西北',
          '沈阳': '东北', '大连': '东北', '长春': '东北', '哈尔滨': '东北',
        };
        return regionGroups[region] || '其他';
      }
      default:
        return String(value);
    }
  }
}
