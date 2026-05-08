import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAssetAccount, AccountType } from '../entities/UserAssetAccount.entity';
import { CreateAssetAccountDto } from '../dto/CreateAssetAccount.dto';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(UserAssetAccount)
    private readonly accountRepository: Repository<UserAssetAccount>,
    @InjectRepository(CashFlowRecord)
    private readonly recordRepository: Repository<CashFlowRecord>,
  ) {}

  async createAccount(userId: string, dto: CreateAssetAccountDto): Promise<UserAssetAccount> {
    const account = this.accountRepository.create({
      userId,
      authStatus: 2, // 手动录入
      ...dto,
    });
    return await this.accountRepository.save(account);
  }

  async getAccounts(userId: string): Promise<UserAssetAccount[]> {
    return await this.accountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAssetOverview(userId: string): Promise<any> {
    const accounts = await this.getAccounts(userId);

    // 统计各类型资产
    const assetDistribution = {
      [AccountType.CASH]: 0,
      [AccountType.DEPOSIT]: 0,
      [AccountType.FUND]: 0,
      [AccountType.STOCK]: 0,
    };

    let total = 0;

    accounts.forEach(acc => {
      const amount = parseFloat(acc.balance.toString());
      assetDistribution[acc.accountType] += amount;
      total += amount;
    });

    return {
      total,
      distribution: assetDistribution,
      accountCount: accounts.length,
      accounts,
    };
  }

  async getAccountById(id: string, userId: string): Promise<UserAssetAccount> {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async deleteAccount(id: string, userId: string): Promise<void> {
    const result = await this.accountRepository.delete({ id, userId });
    if (result.affected === 0) throw new NotFoundException('Account not found');
  }
}
