import { cashflowApiClient } from './client';
import { UserAssetAccount, AssetOverview, AssetAccountType } from '../types';

export interface CreateAssetAccountData {
  accountType: AssetAccountType;
  institutionCode?: string;
  balance: number;
  currency?: string;
  accountName?: string;
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
