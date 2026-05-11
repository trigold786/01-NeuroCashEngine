import { create } from 'zustand';
import { businessApi, GenerateForecastParams, GenerateSopParams } from '../api/business';
import { CashFlowForecast, GeneratedSop, IndustryClassification, CashFlowEvent, EventType } from '../types';

interface BusinessState {
  forecasts: CashFlowForecast[];
  sops: GeneratedSop[];
  industries: IndustryClassification[];
  currentSop: GeneratedSop | null;
  events: CashFlowEvent[];
  loading: boolean;
  error: string | null;
  fetchForecasts: () => Promise<void>;
  generateForecast: (params: GenerateForecastParams) => Promise<void>;
  fetchSops: () => Promise<void>;
  generateSop: (params: GenerateSopParams) => Promise<void>;
  fetchSopById: (id: string) => Promise<void>;
  deleteSop: (id: string) => Promise<void>;
  fetchIndustries: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  createEvent: (params: { eventType: EventType; eventDate: string; amount: number; description?: string }) => Promise<void>;
  seedEvents: () => Promise<void>;
  clearError: () => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  forecasts: [],
  sops: [],
  industries: [],
  currentSop: null,
  events: [],
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

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await businessApi.getEvents();
      set({ events, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch events', loading: false });
    }
  },

  createEvent: async (params) => {
    set({ loading: true, error: null });
    try {
      const event = await businessApi.createEvent(params);
      set((state) => ({ events: [...state.events, event], loading: false }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create event', loading: false });
    }
  },

  seedEvents: async () => {
    set({ loading: true, error: null });
    try {
      await businessApi.seedEvents();
      const events = await businessApi.getEvents();
      set({ events, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to seed events', loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
