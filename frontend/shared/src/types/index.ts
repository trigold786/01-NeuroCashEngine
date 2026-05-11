export enum UserRole {
  CUSTOMER = 'customer',
  ENTERPRISE = 'enterprise',
  ADMIN = 'admin',
}

export enum AccountType {
  INDIVIDUAL = 'individual',
  ENTERPRISE = 'enterprise',
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
export type AssetAccountType = 'CASH' | 'DEPOSIT' | 'FUND' | 'STOCK';

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
  accountTypeName?: string;
  createdAt: Date;
  updatedAt: Date;
  termYears?: number;
  interestRate?: number;
  startDate?: Date;
  endDate?: Date;
  fundCode?: string;
  fundName?: string;
  buyPrice?: number;
  buyDate?: Date;
  shareCount?: number;
  nav?: number;
  stockCode?: string;
  stockName?: string;
  currentPrice?: number;
}

export interface AssetOverview {
  total: number;
  distribution: Record<string, number>;
  chartData: Array<{ name: string; value: number; percentage: string }>;
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
  author?: string;
  imageUrl?: string;
  publishTime?: Date;
  viewCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// B端相关类型
export interface CashFlowForecast {
  forecastId: string;
  userId: string;
  forecastDate: string;
  predictedBalance: number;
  isAlert: boolean;
  alertMessage?: string;
  generatedSopId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum SopType {
  SHORTAGE = 'SHORTAGE',
  SURPLUS = 'SURPLUS',
}

export interface GeneratedSop {
  sopId: string;
  userId: string;
  templateId?: string;
  title: string;
  content: string;
  exportFormat?: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndustryClassification {
  id: number;
  industryCode: number;
  industryName: string;
  description?: string;
  industryFeatures?: any;
  parentId?: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum EventType {
  TAX_DUE = 'TAX_DUE',
  PAYDAY = 'PAYDAY',
  CONTRACT_PAYMENT = 'CONTRACT_PAYMENT',
  LOAN_DUE = 'LOAN_DUE',
  RECEIVABLE_DUE = 'RECEIVABLE_DUE',
}

export interface CashFlowEvent {
  id: string;
  userId: string;
  eventType: EventType;
  eventDate: string;
  amount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 数据产品API类型
export enum AssetCategory {
  CASH = 'CASH',
  DEPOSIT = 'DEPOSIT',
  FUND = 'FUND',
  STOCK = 'STOCK',
  BOND = 'BOND',
}

export interface InvestmentSentiment {
  date: string;
  assetCategory: AssetCategory;
  sentimentScore: number;
  totalSamples: number;
}

export interface DataProductResponse<T> {
  success: boolean;
  data: T;
}
