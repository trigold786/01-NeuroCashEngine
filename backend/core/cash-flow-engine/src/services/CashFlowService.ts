import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';
import { CreateCashFlowRecordDto } from '../dto/CreateCashFlowRecord.dto';
import { UserAssetAccount } from '../entities/UserAssetAccount.entity';

@Injectable()
export class CashFlowService {
  constructor(
    @InjectRepository(CashFlowRecord)
    private readonly recordRepository: Repository<CashFlowRecord>,
    @InjectRepository(UserAssetAccount)
    private readonly accountRepository: Repository<UserAssetAccount>,
  ) {}

  async createRecord(userId: string, dto: CreateCashFlowRecordDto): Promise<CashFlowRecord> {
    const account = await this.accountRepository.findOne({
      where: { accountId: dto.accountId, userId },
    });
    if (!account) throw new NotFoundException('Account not found');

    const record = this.recordRepository.create({
      ...dto,
      tradeTime: new Date(dto.tradeTime),
    });
    return await this.recordRepository.save(record);
  }

  async getRecordsByAccount(accountId: string, userId: string): Promise<CashFlowRecord[]> {
    const account = await this.accountRepository.findOne({
      where: { accountId: accountId, userId },
    });
    if (!account) throw new NotFoundException('Account not found');

    return await this.recordRepository.find({
      where: { accountId },
      order: { tradeTime: 'DESC' },
    });
  }
}
