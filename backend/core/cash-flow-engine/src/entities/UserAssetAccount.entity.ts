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

  @Column({ type: 'tinyint' })
  accountType: AccountType;

  @Column({ length: 64, nullable: true })
  institutionCode?: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  encryptedBalance: string;

  @Column({ length: 8, default: 'CNY' })
  currency: string;

  @Column({ type: 'tinyint', default: 2 })
  authStatus: number;

  @Column({ type: 'datetime', nullable: true })
  lastSyncTime?: Date;

  @Column({ length: 128, nullable: true })
  accountName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
