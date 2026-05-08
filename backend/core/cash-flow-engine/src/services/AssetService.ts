import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAssetAccount, AccountType } from '../entities/UserAssetAccount.entity';
import { CreateAssetAccountDto } from '../dto/CreateAssetAccount.dto';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { encryptBalance, decryptBalance } from '../utils/crypto.util';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(UserAssetAccount)
    private readonly accountRepository: Repository<UserAssetAccount>,
    @InjectRepository(CashFlowRecord)
    private readonly recordRepository: Repository<CashFlowRecord>,
  ) {}

  // 转换枚举值
  convertAccountType(type: string): AccountType {
    const map: Record<string, AccountType> = {
      'CASH': AccountType.CASH,
      'DEPOSIT': AccountType.DEPOSIT,
      'FUND': AccountType.FUND,
      'STOCK': AccountType.STOCK,
    };
    return map[type] ?? AccountType.CASH;
  }

  // 转换为前端友好格式
  formatAccount(account: UserAssetAccount): any {
    const { encryptedBalance, accountId, ...rest } = account;
    const accountTypeNames: Record<number, string> = {
      [AccountType.CASH]: '现金',
      [AccountType.DEPOSIT]: '存款',
      [AccountType.FUND]: '基金',
      [AccountType.STOCK]: '股票',
    };
    return {
      id: accountId,
      ...rest,
      balance: decryptBalance(encryptedBalance),
      accountTypeName: accountTypeNames[account.accountType as number] || '其他',
    };
  }

  async createAccount(userId: string, dto: CreateAssetAccountDto): Promise<any> {
    const accountType = this.convertAccountType(dto.accountType as string);
    
    const account = this.accountRepository.create({
      userId,
      authStatus: 2, // 手动录入
      ...dto,
      accountType,
      encryptedBalance: encryptBalance(dto.balance),
    });
    
    const saved = await this.accountRepository.save(account);
    return this.formatAccount(saved);
  }

  async getAccounts(userId: string): Promise<any[]> {
    const accounts = await this.accountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return accounts.map(acc => this.formatAccount(acc));
  }

  async getAssetOverview(userId: string): Promise<any> {
    const accounts = await this.getAccounts(userId);

    // 统计各类型资产
    const assetDistribution: Record<string, number> = {
      '现金': 0,
      '存款': 0,
      '基金': 0,
      '股票': 0,
    };

    let total = 0;

    accounts.forEach(acc => {
      const amount = acc.balance;
      assetDistribution[acc.accountTypeName] += amount;
      total += amount;
    });

    // 转换为图表友好格式
    const chartData = Object.entries(assetDistribution).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
    })).filter(item => item.value > 0);

    return {
      total,
      distribution: assetDistribution,
      chartData,
      accountCount: accounts.length,
      accounts,
    };
  }

  async getAccountById(id: string, userId: string): Promise<any> {
    const account = await this.accountRepository.findOne({
      where: { accountId: id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');
    return this.formatAccount(account);
  }

  async deleteAccount(id: string, userId: string): Promise<void> {
    const result = await this.accountRepository.delete({ accountId: id, userId });
    if (result.affected === 0) throw new NotFoundException('Account not found');
  }
}
