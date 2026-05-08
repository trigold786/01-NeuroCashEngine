import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  CUSTOMER = 'customer',
  ENTERPRISE = 'enterprise',
  ADMIN = 'admin',
}

export enum AccountType {
  INDIVIDUAL = 'individual',
  ENTERPRISE = 'enterprise',
}

@Entity('nce_users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ unique: true, length: 20, nullable: true })
  phone: string;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.INDIVIDUAL,
  })
  accountType: AccountType;

  @Column({ nullable: true, length: 200 })
  nsiUserId: string; // NSI用户ID，用于与NSI联动

  // 企业用户专属字段
  @Column({ nullable: true, length: 200 })
  companyName: string;

  @Column({ nullable: true, length: 50 })
  industryCode: string; // 行业分类编码（GB/T 4754-2017）

  @Column({ nullable: true, length: 100 })
  industryName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
