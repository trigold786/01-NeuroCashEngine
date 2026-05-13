import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SystemConfig } from '../entities/SystemConfig.entity';

export interface ConfigResponse {
  configKey: string;
  configValue: string;
  description: string | null;
  updatedAt: Date;
}

const DEFAULT_CONFIGS: { key: string; value: string; description: string }[] = [
  { key: 'dataRefreshInterval', value: '3600', description: '数据刷新间隔（秒）' },
  { key: 'maxLoginAttempts', value: '5', description: '最大登录尝试次数' },
  { key: 'sessionTimeout', value: '3600', description: '会话超时时间（秒）' },
  { key: 'maxFileUploadSize', value: '10485760', description: '最大文件上传大小（字节）' },
  { key: 'allowedFileTypes', value: 'jpg,png,pdf,doc,docx,xls,xlsx', description: '允许上传的文件类型' },
  { key: 'maintenanceMode', value: 'false', description: '维护模式' },
  { key: 'apiRateLimit', value: '100', description: 'API 速率限制（请求/分钟）' },
  { key: 'pointsReferralReward', value: '100', description: '推荐奖励积分' },
  { key: 'pointsSigninReward', value: '10', description: '签到奖励积分' },
];

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepository: Repository<SystemConfig>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    for (const cfg of DEFAULT_CONFIGS) {
      const existing = await this.configRepository.findOne({ where: { configKey: cfg.key } });
      if (!existing) {
        await this.configRepository.save(
          this.configRepository.create({ configKey: cfg.key, configValue: cfg.value, description: cfg.description }),
        );
        this.logger.log(`Seeded config: ${cfg.key}=${cfg.value}`);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    const config = await this.configRepository.findOne({ where: { configKey: key } });
    return config ? config.configValue : null;
  }

  async set(key: string, value: string): Promise<ConfigResponse> {
    let config = await this.configRepository.findOne({ where: { configKey: key } });
    if (config) {
      config.configValue = value;
    } else {
      config = this.configRepository.create({ configKey: key, configValue: value });
    }
    await this.configRepository.save(config);
    return {
      configKey: config.configKey,
      configValue: config.configValue,
      description: config.description,
      updatedAt: config.updatedAt,
    };
  }

  async getAll(): Promise<ConfigResponse[]> {
    const configs = await this.configRepository.find({ order: { configKey: 'ASC' } });
    return configs.map(c => ({
      configKey: c.configKey,
      configValue: c.configValue,
      description: c.description,
      updatedAt: c.updatedAt,
    }));
  }

  async getByPrefix(prefix: string): Promise<ConfigResponse[]> {
    const configs = await this.configRepository.find({
      where: { configKey: Like(`${prefix}%`) },
      order: { configKey: 'ASC' },
    });
    return configs.map(c => ({
      configKey: c.configKey,
      configValue: c.configValue,
      description: c.description,
      updatedAt: c.updatedAt,
    }));
  }
}
