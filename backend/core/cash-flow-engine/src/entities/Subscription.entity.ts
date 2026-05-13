import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nce_subscription')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  subscriptionId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  tier: string;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
