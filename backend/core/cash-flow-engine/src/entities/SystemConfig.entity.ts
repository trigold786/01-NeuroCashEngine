import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('nce_system_config')
export class SystemConfig {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  configKey: string;

  @Column({ type: 'text' })
  configValue: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
