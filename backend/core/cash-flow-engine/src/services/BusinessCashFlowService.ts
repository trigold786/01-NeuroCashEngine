import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CashFlowForecast } from '../entities/CashFlowForecast.entity';
import { SopTemplate, SopType } from '../entities/SopTemplate.entity';
import { GeneratedSop } from '../entities/GeneratedSop.entity';
import { IndustryClassification } from '../entities/IndustryClassification.entity';
import { UserAssetAccount } from '../entities/UserAssetAccount.entity';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { CashFlowEvent, EventType } from '../entities/CashFlowEvent.entity';
import { decryptBalance } from '../utils/crypto.util';
import { GenerateForecastDto } from '../dto/GenerateForecast.dto';
import { GenerateSopDto } from '../dto/GenerateSop.dto';
import { CreateCashFlowEventDto } from '../dto/CreateCashFlowEvent.dto';

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
    @InjectRepository(CashFlowEvent)
    private readonly eventRepository: Repository<CashFlowEvent>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
      { industryCode: 13, industryName: '农副食品加工业', level: 1 },
      { industryCode: 14, industryName: '食品制造业', level: 1 },
      { industryCode: 17, industryName: '纺织业', level: 1 },
      { industryCode: 18, industryName: '纺织服装服饰业', level: 1 },
      { industryCode: 20, industryName: '木材加工和木制品业', level: 1 },
      { industryCode: 21, industryName: '家具制造业', level: 1 },
      { industryCode: 23, industryName: '印刷和记录媒介复制业', level: 1 },
      { industryCode: 24, industryName: '文教工美体育娱乐用品制造业', level: 1 },
      { industryCode: 26, industryName: '化学原料和化学制品制造业', level: 1 },
      { industryCode: 31, industryName: '非金属矿物制品业', level: 1 },
      { industryCode: 33, industryName: '金属制品业', level: 1 },
      { industryCode: 34, industryName: '通用设备制造业', level: 1 },
      { industryCode: 35, industryName: '专用设备制造业', level: 1 },
      { industryCode: 36, industryName: '汽车制造业', level: 1 },
      { industryCode: 38, industryName: '电气机械和器材制造业', level: 1 },
      { industryCode: 39, industryName: '计算机通信和其他电子设备制造业', level: 1 },
      { industryCode: 40, industryName: '仪器仪表制造业', level: 1 },
      { industryCode: 41, industryName: '其他制造业', level: 1 },
      { industryCode: 43, industryName: '金属制品机械和设备修理业', level: 1 },
      { industryCode: 49, industryName: '建筑装饰业', level: 1 },
      { industryCode: 55, industryName: '居民服务业', level: 1 },
      { industryCode: 56, industryName: '机动车电子产品和日用产品修理业', level: 1 },
      { industryCode: 59, industryName: '仓储业', level: 1 },
      { industryCode: 63, industryName: '电信广播电视和卫星传输服务', level: 1 },
      { industryCode: 64, industryName: '互联网和相关服务', level: 1 },
      { industryCode: 65, industryName: '软件和信息技术服务业', level: 1 },
      { industryCode: 70, industryName: '房地产业', level: 1 },
      { industryCode: 73, industryName: '研究和试验发展', level: 1 },
      { industryCode: 74, industryName: '专业技术服务业', level: 1 },
      { industryCode: 80, industryName: '机动车电子产品和日用产品修理业', level: 1 },
      { industryCode: 81, industryName: '其他服务业', level: 1 },
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
    const templates = [
      {
        type: SopType.SHORTAGE,
        title: '资金短缺应对SOP',
        content: `
# 资金短缺应对SOP

## 1. 立即核实情况
- 检查账户余额，确认缺口金额和时间点
- 核实应收款项，排查可提前收回的款项
- **预估缺口**: ¥{{predictedBalance}} (预测日期: {{forecastDate}})
- **预警日期**: {{alertDate}}

## 2. 短期融资选项
- 选项A：申请银行短期贷款
- 选项B：申请供应商账期延长
- 选项C：内部资金临时调拨

## 3. 执行与跟踪
- 确定应对方案后立即执行
- 每日跟踪资金状况
- **最新余额**: ¥{{latestBalance}}
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
- **预估盈余**: ¥{{predictedBalance}} (预测日期: {{forecastDate}})
- **评估日期**: {{alertDate}}

## 2. 投资选项
- 选项A：活期理财产品
- 选项B：7天通知存款
- 选项C：货币市场基金

## 3. 执行与监控
- 选择合适产品并执行
- 跟踪产品收益和到期时间
- **最新余额**: ¥{{latestBalance}}
        `,
      },
      {
        type: SopType.LOAN_DUE,
        title: '贷款到期应对SOP',
        content: `
# 贷款到期应对SOP

## 1. 确认贷款信息
- 确认贷款金额和到期日
- 检查当前账户余额
- **贷款金额**: ¥{{predictedBalance}} (到期日: {{forecastDate}})
- **预警日期**: {{alertDate}}

## 2. 还款准备选项
- 选项A：使用现有资金还款
- 选项B：申请贷款展期
- 选项C：通过其他融资渠道还款

## 3. 执行与跟踪
- 确定还款方案后立即执行
- 确认还款到账并保留凭证
- **最新余额**: ¥{{latestBalance}}
        `,
      },
      {
        type: SopType.RECEIVABLE_DUE,
        title: '应收款项催收SOP',
        content: `
# 应收款项催收SOP

## 1. 核实应收信息
- 确认应收金额和账期
- 检查客户信用状况
- **应收金额**: ¥{{predictedBalance}} (到期日: {{forecastDate}})
- **预警日期**: {{alertDate}}

## 2. 催收措施
- 选项A：发送正式催收函
- 选项B：电话沟通协商
- 选项C：启动法律催收程序

## 3. 执行与跟踪
- 实施催收方案并持续跟进
- 记录催收过程和结果
- **最新余额**: ¥{{latestBalance}}
        `,
      },
    ];

    for (const template of templates) {
      const existing = await this.templateRepository.findOne({
        where: { type: template.type },
      });
      if (existing) {
        existing.title = template.title;
        existing.content = template.content;
        existing.isActive = true;
        await this.templateRepository.save(existing);
      } else {
        const entity = this.templateRepository.create(template);
        await this.templateRepository.save(entity);
      }
    }
  }

  async generateForecast(userId: string, dto: GenerateForecastDto): Promise<CashFlowForecast[]> {
    const days = dto.forecastDays || 90;
    const accounts = await this.accountRepository.find({ where: { userId } });
    
    let totalBalance = 0;
    accounts.forEach(acc => {
      totalBalance += decryptBalance(acc.encryptedBalance);
    });

    const events = await this.eventRepository.find({
      where: { userId },
      order: { eventDate: 'ASC' },
    });

    const today = new Date();
    const forecasts: CashFlowForecast[] = [];

    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      const dateStr = forecastDate.toISOString().split('T')[0];
      const dayOfWeek = forecastDate.getDay();
      const dayOfMonth = forecastDate.getDate();
      const month = forecastDate.getMonth();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isMonthEnd = dayOfMonth >= 25;
      const isMidMonth = dayOfMonth >= 10 && dayOfMonth <= 15;

      let predictedBalance = totalBalance;

      const dailyBaseDecay = isWeekend ? 200 : 500;
      predictedBalance -= i * dailyBaseDecay;

      if (isMonthEnd) {
        predictedBalance -= 5000 + Math.random() * 3000;
      }
      if (isMidMonth) {
        predictedBalance -= 2000 + Math.random() * 1000;
      }

      const eventDateStr = (d: Date) => d.toISOString().split('T')[0];
      const matchingEvents = events.filter(e => eventDateStr(e.eventDate) === dateStr);
      for (const event of matchingEvents) {
        predictedBalance -= event.amount;
      }

      const dailyEvents = events.filter(e => {
        const ed = new Date(e.eventDate);
        const diffDays = Math.round((ed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays === i && eventDateStr(e.eventDate) !== dateStr;
      });
      for (const event of dailyEvents) {
        predictedBalance -= event.amount;
      }

      const randomJitter = 0.95 + Math.random() * 0.1;
      predictedBalance *= randomJitter;

      const isAlert = predictedBalance < 50000;

      const forecast = this.forecastRepository.create({
        userId,
        forecastDate: dateStr,
        predictedBalance: Math.max(0, Math.round(predictedBalance * 100) / 100),
        isAlert,
        alertMessage: isAlert ? '预计资金短缺，请提前准备' : undefined,
      });

      forecasts.push(forecast);
    }

    return await this.dataSource.transaction(async (manager) => {
      await manager.delete(CashFlowForecast, { userId });
      return await manager.save(forecasts);
    });
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

    const forecasts = await this.forecastRepository.find({
      where: { userId },
      order: { forecastDate: 'ASC' },
    });

    const alertForecast = forecasts.length > 0 ? (forecasts.find(f => f.isAlert) || forecasts[0]) : null;
    const latestForecast = forecasts.length > 0 ? forecasts[forecasts.length - 1] : null;

    let filledContent = template.content;
    if (alertForecast) {
      filledContent = filledContent.replace(/\{\{predictedBalance\}\}/g, alertForecast.predictedBalance.toFixed(2));
      filledContent = filledContent.replace(/\{\{forecastDate\}\}/g, alertForecast.forecastDate);
      const alertDate = new Date(alertForecast.forecastDate);
      alertDate.setDate(alertDate.getDate() - 3);
      filledContent = filledContent.replace(/\{\{alertDate\}\}/g, alertDate.toISOString().split('T')[0]);
    } else {
      filledContent = filledContent.replace(/\{\{predictedBalance\}\}/g, '0.00');
      filledContent = filledContent.replace(/\{\{forecastDate\}\}/g, new Date().toISOString().split('T')[0]);
      filledContent = filledContent.replace(/\{\{alertDate\}\}/g, new Date().toISOString().split('T')[0]);
    }
    if (latestForecast) {
      filledContent = filledContent.replace(/\{\{latestBalance\}\}/g, latestForecast.predictedBalance.toFixed(2));
    } else {
      filledContent = filledContent.replace(/\{\{latestBalance\}\}/g, '0.00');
    }

    const title = dto.title || `${type === SopType.SHORTAGE ? '资金短缺' : type === SopType.SURPLUS ? '资金盈余' : type === SopType.LOAN_DUE ? '贷款到期' : '应收款项催收'}应对方案`;
    const generatedSop = this.generatedSopRepository.create({
      userId,
      templateId: template.templateId,
      title,
      content: filledContent,
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

  async getEvents(userId: string): Promise<CashFlowEvent[]> {
    return await this.eventRepository.find({
      where: { userId },
      order: { eventDate: 'ASC' },
    });
  }

  async createEvent(userId: string, dto: CreateCashFlowEventDto): Promise<CashFlowEvent> {
    const event = this.eventRepository.create({
      userId,
      eventType: dto.eventType,
      eventDate: new Date(dto.eventDate),
      amount: dto.amount,
      description: dto.description,
    });
    return await this.eventRepository.save(event);
  }

  async seedSampleEvents(userId: string): Promise<void> {
    const existingCount = await this.eventRepository.count({ where: { userId } });
    if (existingCount > 0) return;

    const today = new Date();
    const sampleEvents: CreateCashFlowEventDto[] = [
      { eventType: EventType.TAX_DUE, eventDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 15000, description: '季度税款申报' },
      { eventType: EventType.PAYDAY, eventDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 50000, description: '员工工资发放' },
      { eventType: EventType.CONTRACT_PAYMENT, eventDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 80000, description: '供应商合同款' },
      { eventType: EventType.LOAN_DUE, eventDate: new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 100000, description: '银行贷款到期' },
      { eventType: EventType.RECEIVABLE_DUE, eventDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 60000, description: '客户应收账款' },
    ];

    for (const dto of sampleEvents) {
      await this.createEvent(userId, dto);
    }
  }
}
