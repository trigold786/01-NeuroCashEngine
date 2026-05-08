import { create } from 'zustand';
import { businessApi, GenerateForecastParams, GenerateSopParams } from '../api/business';
import { CashFlowForecast, GeneratedSop, IndustryClassification } from '../types';

interface BusinessState {
  forecasts: CashFlowForecast[];
  sops: GeneratedSop[];
  industries: IndustryClassification[];
  currentSop: GeneratedSop | null;
  loading: boolean;
  error: string | null;
  fetchForecasts: () => Promise<void>;
  generateForecast: (params: GenerateForecastParams) => Promise<void>;
  fetchSops: () => Promise<void>;
  generateSop: (params: GenerateSopParams) => Promise<void>;
  fetchSopById: (id: string) => Promise<void>;
  deleteSop: (id: string) => Promise<void>;
  fetchIndustries: () => Promise<void>;
  clearError: () => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  forecasts: [],
  sops: [],
  industries: [],
  currentSop: null,
  loading: false,
  error: null,

  fetchForecasts: async () => {
    set({ loading: true, error: null });
    try {
      const forecasts = await businessApi.getForecast();
      set({ forecasts, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch forecasts', loading: false });
    }
  },

  generateForecast: async (params) => {
    set({ loading: true, error: null });
    try {
      const forecasts = await businessApi.generateForecast(params);
      set({ forecasts, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to generate forecast', loading: false });
    }
  },

  fetchSops: async () => {
    set({ loading: true, error: null });
    try {
      const sops = await businessApi.getSops();
      set({ sops, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch SOPs', loading: false });
    }
  },

  generateSop: async (params) => {
    set({ loading: true, error: null });
    try {
      const sop = await businessApi.generateSop(params);
      set((state) => ({ sops: [sop, ...state.sops], loading: false }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to generate SOP', loading: false });
    }
  },

  fetchSopById: async (id) => {
    set({ loading: true, error: null });
    try {
      const sop = await businessApi.getSopById(id);
      set({ currentSop: sop, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch SOP', loading: false });
    }
  },

  deleteSop: async (id) => {
    set({ loading: true, error: null });
    try {
      await businessApi.deleteSop(id);
      set((state) => ({ sops: state.sops.filter((s) => s.sopId !== id), loading: false }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete SOP', loading: false });
    }
  },

  fetchIndustries: async () => {
    set({ loading: true, error: null });
    try {
      const industries = await businessApi.getIndustries();
      set({ industries, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch industries', loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
