import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NewsSourceType {
  OFFICIAL = 'OFFICIAL', // 官方渠道
  VERIFIED = 'VERIFIED', // 非官方但已验证
}

export enum NewsCategory {
  GENERAL = 'GENERAL',
  STOCK = 'STOCK',
  FUND = 'FUND',
  BOND = 'BOND',
  MACRO = 'MACRO',
}

@Entity('nce_news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 512, nullable: true })
  summary: string;

  @Column({
    type: 'enum',
    enum: NewsCategory,
    default: NewsCategory.GENERAL,
  })
  category: NewsCategory;

  @Column({
    type: 'enum',
    enum: NewsSourceType,
  })
  sourceType: NewsSourceType;

  @Column({ length: 128 })
  sourceName: string;

  @Column({ length: 512, nullable: true })
  sourceUrl: string;

  @Column({ length: 128, nullable: true })
  author: string;

  @Column({ length: 512, nullable: true })
  imageUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  publishTime: Date;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isLinkValid: boolean; // 发布前验证sourceUrl是否可达

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
