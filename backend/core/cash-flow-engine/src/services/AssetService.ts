import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAssetAccount, AccountType } from '../entities/UserAssetAccount.entity';
import { CreateAssetAccountDto } from '../dto/CreateAssetAccount.dto';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { encryptBalance, decryptBalance } from '../utils/crypto.util';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);
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
    
    let balance = 0;
    if (encryptedBalance && encryptedBalance.includes(':')) {
      try {
        balance = decryptBalance(encryptedBalance);
      } catch (err) {
        balance = 0;
      }
    } else if (encryptedBalance) {
      balance = parseFloat(encryptedBalance) || 0;
    }
    
    return {
      id: accountId,
      ...rest,
      balance,
      accountTypeName: accountTypeNames[account.accountType as number] || '其他',
      termYears: account.termYears,
      interestRate: account.interestRate,
      startDate: account.startDate,
      endDate: account.endDate,
      fundCode: account.fundCode,
      fundName: account.fundName,
      buyPrice: account.buyPrice,
      buyDate: account.buyDate,
      shareCount: account.shareCount,
      nav: account.nav,
      stockCode: account.stockCode,
      stockName: account.stockName,
      currentPrice: account.currentPrice,
    };
  }

  async createAccount(userId: string, dto: CreateAssetAccountDto): Promise<any> {
    this.logger.log(`Creating account for user ${userId} with dto: ${JSON.stringify(dto)}`);
    const accountType = this.convertAccountType(dto.accountType as string);

    const balanceStr = dto.balance.toString();

    const account = new UserAssetAccount();
    account.userId = userId;
    account.accountType = accountType;
    account.accountName = dto.accountName || '默认账户';
    account.encryptedBalance = balanceStr;
    account.currency = dto.currency || 'CNY';
    account.authStatus = 2;
    account.institutionCode = dto.institutionCode;

    if (accountType === AccountType.DEPOSIT) {
      account.termYears = dto.termYears;
      account.interestRate = dto.interestRate;
      account.startDate = dto.startDate ? new Date(dto.startDate) : undefined;
      account.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    }

    if (accountType === AccountType.FUND) {
      account.fundCode = dto.fundCode;
      account.fundName = dto.fundName;
      account.buyPrice = dto.buyPrice;
      account.buyDate = dto.buyDate ? new Date(dto.buyDate) : undefined;
      account.shareCount = dto.shareCount;
      account.nav = dto.nav;
    }

    if (accountType === AccountType.STOCK) {
      account.stockCode = dto.stockCode;
      account.stockName = dto.stockName;
      account.buyPrice = dto.buyPrice;
      account.buyDate = dto.buyDate ? new Date(dto.buyDate) : undefined;
      account.shareCount = dto.shareCount;
      account.currentPrice = dto.currentPrice;
    }

    this.logger.log(`Account entity before save: ${JSON.stringify(account)}`);
    try {
      const saved = await this.accountRepository.save(account);
      this.logger.log(`Saved account: ${JSON.stringify(saved)}`);
      return this.formatAccount(saved);
    } catch (err: any) {
      this.logger.error(`Failed to save account: ${err.message}`, err.stack);
      throw err;
    }
  }

  async getAccounts(userId: string): Promise<any[]> {
    this.logger.log(`getAccounts called for userId: ${userId}`);
    const accounts = await this.accountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    this.logger.log(`Found ${accounts.length} accounts`);
    return accounts.map(acc => this.formatAccount(acc));
  }

  async getAssetOverview(userId: string): Promise<any> {
    this.logger.log(`getAssetOverview called for userId: ${userId}`);
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
