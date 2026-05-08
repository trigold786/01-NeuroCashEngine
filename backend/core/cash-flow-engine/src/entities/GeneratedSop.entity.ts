import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nce_generated_sop')
export class GeneratedSop {
  @PrimaryGeneratedColumn('uuid')
  sopId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  templateId?: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  exportFormat?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
