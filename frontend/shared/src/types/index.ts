export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ENTERPRISE = 'ENTERPRISE',
  ADMIN = 'ADMIN',
}

export enum AccountType {
  INDIVIDUAL = 'INDIVIDUAL',
  ENTERPRISE = 'ENTERPRISE',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  username: string;
  role: UserRole;
  accountType: AccountType;
  nsiUserId?: string;
  companyName?: string;
  industryCode?: string;
  industryName?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
}

// C端资产相关类型
export enum AssetAccountType {
  CASH = 'CASH',
  DEPOSIT = 'DEPOSIT',
  FUND = 'FUND',
  STOCK = 'STOCK',
}

export interface UserAssetAccount {
  id: string;
  userId: string;
  accountType: AssetAccountType;
  institutionCode?: string;
  balance: number;
  currency: string;
  authStatus: number;
  lastSyncTime?: Date;
  accountName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetOverview {
  total: number;
  distribution: Record<AssetAccountType, number>;
  accountCount: number;
  accounts: UserAssetAccount[];
}

// 新闻相关类型
export enum NewsSourceType {
  OFFICIAL = 'OFFICIAL',
  VERIFIED = 'VERIFIED',
}

export enum NewsCategory {
  GENERAL = 'GENERAL',
  STOCK = 'STOCK',
  FUND = 'FUND',
  BOND = 'BOND',
  MACRO = 'MACRO',
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: NewsCategory;
  sourceType: NewsSourceType;
  sourceName: string;
  sourceUrl?: string;
  imageUrl?: string;
  publishTime?: Date;
  viewCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
