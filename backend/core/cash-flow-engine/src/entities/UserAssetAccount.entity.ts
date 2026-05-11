import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AccountType {
  CASH = 0,
  DEPOSIT = 1,
  FUND = 3,
  STOCK = 2,
  WECHAT = 4,
  ALIPAY = 5,
}

@Entity('nce_user_asset_account')
export class UserAssetAccount {
  @PrimaryGeneratedColumn('uuid')
  accountId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'smallint' })
  accountType: AccountType;

  @Column({ length: 64, nullable: true })
  institutionCode?: string;

  @Column({ length: 128, nullable: true })
  accountName?: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  encryptedBalance: string;

  @Column({ length: 8, default: 'CNY' })
  currency: string;

  @Column({ type: 'smallint', default: 2 })
  authStatus: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncTime?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', nullable: true })
  termYears?: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  interestRate?: number;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'varchar', length: 32, nullable: true })
  fundCode?: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  fundName?: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  buyPrice?: number;

  @Column({ type: 'date', nullable: true })
  buyDate?: Date;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  shareCount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  nav?: number;

  @Column({ type: 'varchar', length: 32, nullable: true })
  stockCode?: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  stockName?: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  currentPrice?: number;
}
