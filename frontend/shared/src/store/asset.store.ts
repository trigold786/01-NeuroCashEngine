import { create } from 'zustand';
import { assetApi, CreateAssetAccountData } from '../api/asset';
import { UserAssetAccount, AssetOverview, AssetAccountType } from '../types';

interface AssetState {
  overview: AssetOverview | null;
  accounts: UserAssetAccount[];
  loading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
  createAccount: (data: CreateAssetAccountData) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  overview: null,
  accounts: [],
  loading: false,
  error: null,

  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const overview = await assetApi.getOverview();
      set({ overview, accounts: overview.accounts, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch overview', loading: false });
    }
  },

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const accounts = await assetApi.getAccounts();
      set({ accounts, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch accounts', loading: false });
    }
  },

  createAccount: async (data) => {
    set({ loading: true, error: null });
    try {
      const account = await assetApi.createAccount(data);
      // 重新获取概览
      const overview = await assetApi.getOverview();
      set({ overview, accounts: overview.accounts, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create account', loading: false });
    }
  },

  deleteAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      await assetApi.deleteAccount(id);
      // 重新获取概览
      const overview = await assetApi.getOverview();
      set({ overview, accounts: overview.accounts, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete account', loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
