import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserAssetAccount } from './UserAssetAccount.entity';

@Entity('nce_cash_flow_record')
export class CashFlowRecord {
  @PrimaryGeneratedColumn('uuid')
  recordId: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'timestamp' })
  tradeTime: Date;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  amount: number;

  @Column({ length: 32 })
  tradeType: string;

  @Column({ length: 128, nullable: true })
  counterparty?: string;

  @Column({ type: 'int', nullable: true })
  aiCategoryId?: number;

  @ManyToOne(() => UserAssetAccount)
  @JoinColumn({ name: 'accountId' })
  account?: UserAssetAccount;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
