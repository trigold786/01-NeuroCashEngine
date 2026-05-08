import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nce_industry_classification')
export class IndustryClassification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  industryCode: number;

  @Column({ length: 200 })
  industryName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json', nullable: true })
  industryFeatures?: any; // 行业特征，用于预测优化

  @Column({ type: 'int', nullable: true })
  parentId?: number;

  @Column({ type: 'int', default: 0 })
  level: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
