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
