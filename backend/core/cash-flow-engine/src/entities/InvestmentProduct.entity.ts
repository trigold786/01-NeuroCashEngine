import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('nce_investment_product')
export class InvestmentProduct {
  @PrimaryGeneratedColumn('uuid')
  productId: string;

  @Column({ length: 32 })
  productCode: string;

  @Column({ length: 128 })
  productName: string;

  @Column({ type: 'smallint' })
  assetClass: number;

  @Column({ type: 'smallint' })
  riskLevel: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minInvestment: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  expectedRoi: number;

  @Column({ type: 'int', nullable: true })
  liquidityDays: number;

  @Column({ length: 256, nullable: true })
  description: string;

  @Column({ length: 64 })
  category: string;

  @CreateDateColumn()
  createdAt: Date;
}
