import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nce_cash_flow_forecast')
export class CashFlowForecast {
  @PrimaryGeneratedColumn('uuid')
  forecastId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  forecastDate: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  predictedBalance: number;

  @Column({ type: 'boolean', default: false })
  isAlert: boolean;

  @Column({ type: 'text', nullable: true })
  alertMessage?: string;

  @Column({ type: 'uuid', nullable: true })
  generatedSopId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
