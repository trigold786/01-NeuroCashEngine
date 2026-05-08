import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AssetCategory {
  CASH = 'CASH',
  DEPOSIT = 'DEPOSIT',
  FUND = 'FUND',
  STOCK = 'STOCK',
  BOND = 'BOND',
}

@Entity('nce_investment_sentiment')
export class InvestmentSentiment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  date: string; // YYYY-MM-DD

  @Column({
    type: 'enum',
    enum: AssetCategory,
  })
  assetCategory: AssetCategory;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  sentimentScore: number; // 0-100，越高越乐观

  @Column({ type: 'int' })
  totalSamples: number; // 样本数量

  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON字符串，存储额外信息

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
