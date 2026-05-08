import { create } from 'zustand';
import { newsApi, GetNewsListParams } from '../api/news';
import { News } from '../types';

interface NewsState {
  newsList: News[];
  currentNews: News | null;
  total: number;
  loading: boolean;
  error: string | null;
  fetchNewsList: (params?: GetNewsListParams) => Promise<void>;
  fetchNewsById: (id: string) => Promise<void>;
  clearCurrentNews: () => void;
  clearError: () => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  newsList: [],
  currentNews: null,
  total: 0,
  loading: false,
  error: null,

  fetchNewsList: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await newsApi.getNewsList(params);
      set({ newsList: response.list, total: response.total, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch news', loading: false });
    }
  },

  fetchNewsById: async (id) => {
    set({ loading: true, error: null });
    try {
      const news = await newsApi.getNewsById(id);
      set({ currentNews: news, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch news', loading: false });
    }
  },

  clearCurrentNews: () => set({ currentNews: null }),
  clearError: () => set({ error: null }),
}));
