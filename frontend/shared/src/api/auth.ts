import apiClient from './client';
import { AuthResponse } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  phone?: string;
  accountType?: string;
  companyName?: string;
  industryCode?: string;
  industryName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post('/auth/register', data);
  },

  async login(data: LoginData): Promise<AuthResponse> {
    return apiClient.post('/auth/login', data);
  },

  async getUser(id: string): Promise<any> {
    return apiClient.get(`/users/${id}`);
  },
};
