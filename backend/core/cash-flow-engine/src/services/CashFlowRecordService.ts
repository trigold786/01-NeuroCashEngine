import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { UserAssetAccount } from '../entities/UserAssetAccount.entity';

interface RecordQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface StatisticsResult {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  byCategory: { categoryId: number; totalAmount: number; count: number; type: string }[];
  totalRecords: number;
}

@Injectable()
export class CashFlowRecordService {
  private readonly logger = new Logger(CashFlowRecordService.name);

  constructor(
    @InjectRepository(CashFlowRecord)
    private readonly recordRepository: Repository<CashFlowRecord>,
    @InjectRepository(UserAssetAccount)
    private readonly accountRepository: Repository<UserAssetAccount>,
  ) {}

  async seedDemoData(userId: string): Promise<{ count: number; message: string }> {
    const existing = await this.recordRepository.count();
    if (existing > 0) {
      return { count: existing, message: 'Demo data already exists, skipping seed' };
    }

    let accounts = await this.accountRepository.find({ where: { userId } });
    if (accounts.length === 0) {
      const now = new Date();
      const accountData = [
        { accountName: '工资卡', accountType: 0, currency: 'CNY' },
        { accountName: '储蓄账户', accountType: 1, currency: 'CNY' },
        { accountName: '微信零钱', accountType: 4, currency: 'CNY' },
        { accountName: '支付宝余额', accountType: 5, currency: 'CNY' },
      ];
      for (const a of accountData) {
        const acc = this.accountRepository.create({ ...a, userId });
        accounts.push(await this.accountRepository.save(acc));
      }
    }

    const records: Partial<CashFlowRecord>[] = [];
    const now = new Date();
    const counterparties = ['美团外卖', '京东', '滴滴出行', '星巴克', '全家便利店', '盒马鲜生', '瑞幸咖啡', '肯德基', '麦当劳', '喜茶'];
    const expenseTypes = ['餐饮', '交通', '购物', '娱乐', '生活缴费', '医疗', '教育', '其他'];
    const incomeTypes = ['工资', '奖金', '理财收益', '其他收入'];

    for (let day = 89; day >= 0; day--) {
      const d = new Date(now);
      d.setDate(d.getDate() - day);
      d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

      const account = accounts[Math.floor(Math.random() * accounts.length)];

      // Daily random expense (1-3 transactions per day)
      const dailyTxCount = 1 + Math.floor(Math.random() * 3);
      for (let tx = 0; tx < dailyTxCount; tx++) {
        const isExpense = !(day % 7 === 0 && tx === 0);
        const amount = isExpense
          ? parseFloat((Math.random() * 500 + 5).toFixed(2))
          : parseFloat((Math.random() * 100 + 20).toFixed(2));
        records.push({
          accountId: account.accountId,
          tradeTime: new Date(d.getTime() + tx * 3600000),
          amount: isExpense ? -amount : amount,
          tradeType: isExpense ? expenseTypes[Math.floor(Math.random() * expenseTypes.length)] : '其他',
          counterparty: isExpense ? counterparties[Math.floor(Math.random() * counterparties.length)] : undefined,
          aiCategoryId: isExpense ? Math.floor(Math.random() * 10) + 1 : null,
        });
      }

      // Weekly payroll (every 7 days, salary account)
      if (day % 7 === 0) {
        records.push({
          accountId: accounts[0].accountId,
          tradeTime: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 0, 0),
          amount: 8500,
          tradeType: '工资',
          counterparty: 'ABC科技有限公司',
          aiCategoryId: 20,
        });
      }

      // Monthly bill (day 1, 10, 20)
      if (day % 10 === 0) {
        records.push({
          accountId: accounts[1].accountId,
          tradeTime: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 6, 0, 0),
          amount: -parseFloat((Math.random() * 3000 + 500).toFixed(2)),
          tradeType: '生活缴费',
          counterparty: '国家电网',
          aiCategoryId: 5,
        });
      }
    }

    await this.recordRepository.save(records);
    this.logger.log(`Seeded ${records.length} demo records for userId: ${userId}`);
    return { count: records.length, message: `Seeded ${records.length} records successfully` };
  }

  async getRecords(userId: string, query: RecordQuery = {}): Promise<{ data: CashFlowRecord[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, startDate, endDate } = query;
    const accounts = await this.accountRepository.find({ where: { userId }, select: ['accountId'] });
    if (accounts.length === 0) {
      return { data: [], total: 0, page, limit };
    }
    const accountIds = accounts.map((a) => a.accountId);

    const where: any = { accountId: In(accountIds) };
    if (startDate && endDate) {
      where.tradeTime = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.tradeTime = Between(new Date(startDate), new Date('2099-12-31'));
    } else if (endDate) {
      where.tradeTime = Between(new Date('2000-01-01'), new Date(endDate));
    }

    const [data, total] = await this.recordRepository.findAndCount({
      where,
      order: { tradeTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getStatistics(userId: string, startDate?: string, endDate?: string): Promise<StatisticsResult> {
    const accounts = await this.accountRepository.find({ where: { userId }, select: ['accountId'] });
    if (accounts.length === 0) {
      return { totalIncome: 0, totalExpense: 0, netAmount: 0, byCategory: [], totalRecords: 0 };
    }
    const accountIds = accounts.map((a) => a.accountId);

    const where: any = { accountId: In(accountIds) };
    if (startDate && endDate) {
      where.tradeTime = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.tradeTime = Between(new Date(startDate), new Date('2099-12-31'));
    } else if (endDate) {
      where.tradeTime = Between(new Date('2000-01-01'), new Date(endDate));
    }

    const records = await this.recordRepository.find({ where });
    const totalIncome = records.filter((r) => r.amount > 0).reduce((s, r) => s + Number(r.amount), 0);
    const totalExpense = records.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(Number(r.amount)), 0);

    const categoryMap = new Map<number, { totalAmount: number; count: number; type: string }>();
    for (const r of records) {
      if (r.aiCategoryId != null) {
        const existing = categoryMap.get(r.aiCategoryId) || { totalAmount: 0, count: 0, type: r.amount > 0 ? 'INCOME' : 'EXPENSE' };
        existing.totalAmount += Number(r.amount);
        existing.count++;
        categoryMap.set(r.aiCategoryId, existing);
      }
    }

    return {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      byCategory: Array.from(categoryMap.entries()).map(([categoryId, v]) => ({ categoryId, ...v })),
      totalRecords: records.length,
    };
  }
}
