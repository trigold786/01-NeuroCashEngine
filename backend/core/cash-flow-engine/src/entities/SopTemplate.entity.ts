import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SopType {
  SHORTAGE = 'SHORTAGE',
  SURPLUS = 'SURPLUS',
  LOAN_DUE = 'LOAN_DUE',
  RECEIVABLE_DUE = 'RECEIVABLE_DUE',
}

@Entity('nce_sop_template')
export class SopTemplate {
  @PrimaryGeneratedColumn('uuid')
  templateId: string;

  @Column({
    type: 'enum',
    enum: SopType,
  })
  type: SopType;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', nullable: true })
  industryCode?: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
