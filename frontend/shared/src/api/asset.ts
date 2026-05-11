import { cashflowApiClient } from './client';
import { UserAssetAccount, AssetOverview } from '../types';

export interface CreateAssetAccountData {
  accountType: string;
  institutionCode?: string;
  balance: number;
  currency?: string;
  accountName?: string;
  termYears?: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  fundCode?: string;
  fundName?: string;
  buyPrice?: number;
  buyDate?: string;
  shareCount?: number;
  nav?: number;
  stockCode?: string;
  stockName?: string;
  currentPrice?: number;
}

export const assetApi = {
  async getOverview(): Promise<AssetOverview> {
    return await cashflowApiClient.get('/assets/overview');
  },

  async getAccounts(): Promise<UserAssetAccount[]> {
    return await cashflowApiClient.get('/assets/accounts');
  },

  async createAccount(data: CreateAssetAccountData): Promise<UserAssetAccount> {
    return await cashflowApiClient.post('/assets/accounts', data);
  },

  async getAccountById(id: string): Promise<UserAssetAccount> {
    return await cashflowApiClient.get(`/assets/accounts/${id}`);
  },

  async deleteAccount(id: string): Promise<void> {
    return await cashflowApiClient.delete(`/assets/accounts/${id}`);
  },
};
