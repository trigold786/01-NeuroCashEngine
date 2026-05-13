import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('nce_referral_code')
export class ReferralCode {
  @PrimaryGeneratedColumn('uuid')
  referralId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ length: 32, unique: true })
  code: string;

  @Column({ type: 'int', default: 0 })
  usedCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
