import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EventType {
  TAX_DUE = 'TAX_DUE',
  PAYDAY = 'PAYDAY',
  CONTRACT_PAYMENT = 'CONTRACT_PAYMENT',
  LOAN_DUE = 'LOAN_DUE',
  RECEIVABLE_DUE = 'RECEIVABLE_DUE',
}

@Entity('nce_cash_flow_events')
export class CashFlowEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  userId: string;

  @Column({ type: 'enum', enum: EventType })
  eventType: EventType;

  @Column({ type: 'date' })
  eventDate: Date;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ length: 256, nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}