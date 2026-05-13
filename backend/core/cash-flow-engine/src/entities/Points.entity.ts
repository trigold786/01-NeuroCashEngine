import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nce_points')
export class Points {
  @PrimaryGeneratedColumn('uuid')
  pointsId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int', default: 0 })
  balance: number;

  @Column({ type: 'int', default: 0 })
  totalEarned: number;

  @Column({ type: 'int', default: 0 })
  totalSpent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
