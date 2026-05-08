import { contentApiClient } from './client';
import { News, NewsCategory, NewsSourceType } from '../types';

export interface GetNewsListParams {
  category?: NewsCategory;
  sourceType?: NewsSourceType;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface GetNewsListResponse {
  list: News[];
  total: number;
  page: number;
  limit: number;
}

export const newsApi = {
  async getNewsList(params?: GetNewsListParams): Promise<GetNewsListResponse> {
    return await contentApiClient.get('/news', { params });
  },

  async getNewsById(id: string): Promise<News> {
    return await contentApiClient.get(`/news/${id}`);
  },
};
