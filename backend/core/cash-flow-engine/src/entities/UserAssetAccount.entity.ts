import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AccountType {
  CASH = 'CASH', // 现金
  DEPOSIT = 'DEPOSIT', // 存款
  FUND = 'FUND', // 基金
  STOCK = 'STOCK', // 股票
}

@Entity('nce_user_asset_account')
export class UserAssetAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  accountType: AccountType;

  @Column({ length: 64, nullable: true })
  institutionCode: string; // 机构代码（如银行代码、券商代码）

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    default: 0,
  })
  balance: number;

  @Column({ length: 8, default: 'CNY' })
  currency: string;

  @Column({ type: 'tinyint', default: 1 })
  authStatus: number; // 0=无效，1=有效，2=手动录入

  @Column({ type: 'datetime', nullable: true })
  lastSyncTime: Date;

  @Column({ length: 128, nullable: true })
  accountName: string; // 账户自定义名称

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
