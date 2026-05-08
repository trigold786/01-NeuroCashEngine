import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserAssetAccount } from './UserAssetAccount.entity';

export enum TradeType {
  INCOME = 'INCOME', // 收入
  EXPENSE = 'EXPENSE', // 支出
  TRANSFER = 'TRANSFER', // 转账
  INVESTMENT = 'INVESTMENT', // 投资
}

@Entity('nce_cash_flow_record')
export class CashFlowRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'datetime' })
  tradeTime: Date;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
  })
  amount: number; // 正=收入/转入，负=支出/转出

  @Column({
    type: 'enum',
    enum: TradeType,
  })
  tradeType: TradeType;

  @Column({ length: 128, nullable: true })
  counterparty: string; // 交易对手方

  @Column({ length: 256, nullable: true })
  remark: string; // 备注

  @Column({ type: 'int', nullable: true })
  aiCategoryId: number; // AI智能分类标签ID

  @ManyToOne(() => UserAssetAccount)
  @JoinColumn({ name: 'accountId' })
  account: UserAssetAccount;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
