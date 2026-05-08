import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashFlowForecast } from '../entities/CashFlowForecast.entity';
import { SopTemplate, SopType } from '../entities/SopTemplate.entity';
import { GeneratedSop } from '../entities/GeneratedSop.entity';
import { IndustryClassification } from '../entities/IndustryClassification.entity';
import { UserAssetAccount } from '../entities/UserAssetAccount.entity';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { decryptBalance } from '../utils/crypto.util';
import { GenerateForecastDto } from '../dto/GenerateForecast.dto';
import { GenerateSopDto } from '../dto/GenerateSop.dto';

@Injectable()
export class BusinessCashFlowService {
  constructor(
    @InjectRepository(CashFlowForecast)
    private readonly forecastRepository: Repository<CashFlowForecast>,
    @InjectRepository(SopTemplate)
    private readonly templateRepository: Repository<SopTemplate>,
    @InjectRepository(GeneratedSop)
    private readonly generatedSopRepository: Repository<GeneratedSop>,
    @InjectRepository(IndustryClassification)
    private readonly industryRepository: Repository<IndustryClassification>,
    @InjectRepository(UserAssetAccount)
    private readonly accountRepository: Repository<UserAssetAccount>,
    @InjectRepository(CashFlowRecord)
    private readonly recordRepository: Repository<CashFlowRecord>,
  ) {}

  async initializeIndustryData(): Promise<void> {
    const count = await this.industryRepository.count();
    if (count > 0) return;

    const industries = [
      { industryCode: 51, industryName: '批发业', level: 1 },
      { industryCode: 52, industryName: '零售业', level: 1 },
      { industryCode: 61, industryName: '住宿业', level: 1 },
      { industryCode: 62, industryName: '餐饮业', level: 1 },
      { industryCode: 71, industryName: '租赁业', level: 1 },
      { industryCode: 72, industryName: '商务服务业', level: 1 },
    ];

    for (const industry of industries) {
      const entity = this.industryRepository.create({
        ...industry,
        industryFeatures: { avgCashCycle: 30, typicalOutgoRatio: 0.7 },
      });
      await this.industryRepository.save(entity);
    }
  }

  async initializeSopTemplates(): Promise<void> {
    const count = await this.templateRepository.count();
    if (count > 0) return;

    const templates = [
      {
        type: SopType.SHORTAGE,
        title: '资金短缺应对SOP',
        content: `
# 资金短缺应对SOP

## 1. 立即核实情况
- 检查账户余额，确认缺口金额和时间点
- 核实应收款项，排查可提前收回的款项

## 2. 短期融资选项
- 选项A：申请银行短期贷款
- 选项B：申请供应商账期延长
- 选项C：内部资金临时调拨

## 3. 执行与跟踪
- 确定应对方案后立即执行
- 每日跟踪资金状况
        `,
      },
      {
        type: SopType.SURPLUS,
        title: '资金盈余增值SOP',
        content: `
# 资金盈余增值SOP

## 1. 评估资金状况
- 计算可用闲置资金
- 确定闲置时间周期

## 2. 投资选项
- 选项A：活期理财产品
- 选项B：7天通知存款
- 选项C：货币市场基金

## 3. 执行与监控
- 选择合适产品并执行
- 跟踪产品收益和到期时间
        `,
      },
    ];

    for (const template of templates) {
      const entity = this.templateRepository.create(template);
      await this.templateRepository.save(entity);
    }
  }

  async generateForecast(userId: string, dto: GenerateForecastDto): Promise<CashFlowForecast[]> {
    const days = dto.forecastDays || 90;
    const accounts = await this.accountRepository.find({ where: { userId } });
    
    let totalBalance = 0;
    accounts.forEach(acc => {
      totalBalance += decryptBalance(acc.encryptedBalance);
    });

    const forecasts: CashFlowForecast[] = [];
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      const randomFactor = 0.95 + Math.random() * 0.1;
      const predictedBalance = totalBalance * randomFactor - (i * 1000);
      
      const isAlert = predictedBalance < 50000;
      
      const forecast = this.forecastRepository.create({
        userId,
        forecastDate: forecastDate.toISOString().split('T')[0],
        predictedBalance: Math.max(0, predictedBalance),
        isAlert,
        alertMessage: isAlert ? '预计资金短缺，请提前准备' : undefined,
      });
      
      forecasts.push(forecast);
    }

    await this.forecastRepository.delete({ userId });
    return await this.forecastRepository.save(forecasts);
  }

  async getForecast(userId: string): Promise<CashFlowForecast[]> {
    return await this.forecastRepository.find({
      where: { userId },
      order: { forecastDate: 'ASC' },
    });
  }

  async generateSop(userId: string, dto: GenerateSopDto): Promise<GeneratedSop> {
    const type = dto.type || SopType.SHORTAGE;
    const template = await this.templateRepository.findOne({
      where: { type, isActive: true },
    });

    if (!template) {
      throw new NotFoundException('SOP template not found');
    }

    const title = dto.title || `${type === SopType.SHORTAGE ? '资金短缺' : '资金盈余'}应对方案`;
    const generatedSop = this.generatedSopRepository.create({
      userId,
      templateId: template.templateId,
      title,
      content: template.content,
    });

    return await this.generatedSopRepository.save(generatedSop);
  }

  async getSops(userId: string): Promise<GeneratedSop[]> {
    return await this.generatedSopRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSopById(sopId: string, userId: string): Promise<GeneratedSop> {
    const sop = await this.generatedSopRepository.findOne({
      where: { sopId, userId },
    });
    if (!sop) throw new NotFoundException('SOP not found');
    return sop;
  }

  async deleteSop(sopId: string, userId: string): Promise<void> {
    const result = await this.generatedSopRepository.delete({ sopId, userId });
    if (result.affected === 0) throw new NotFoundException('SOP not found');
  }

  async getIndustries(): Promise<IndustryClassification[]> {
    return await this.industryRepository.find({
      order: { industryCode: 'ASC' },
    });
  }
}
