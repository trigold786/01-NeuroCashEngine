import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('nce_points_record')
export class PointsRecord {
  @PrimaryGeneratedColumn('uuid')
  recordId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ length: 64 })
  reason: string;

  @Column({ length: 256, nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  referralUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
