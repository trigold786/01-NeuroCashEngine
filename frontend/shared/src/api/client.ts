import axios, { AxiosError, AxiosInstance } from 'axios';

// 服务基础URL配置
const SERVICE_BASE_URLS = {
  ACCOUNT: (import.meta as any).env?.VITE_ACCOUNT_API_URL || '/api',
  CASHFLOW: (import.meta as any).env?.VITE_CASHFLOW_API_URL || '',
  CONTENT: (import.meta as any).env?.VITE_CONTENT_API_URL || '',
};

// 创建通用API客户端工厂
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(
    (config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('nce_access_token') : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
      if (typeof window !== 'undefined' && error.response?.status === 401) {
        localStorage.removeItem('nce_access_token');
        window.location.href = '/';
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export const accountApiClient = createApiClient(SERVICE_BASE_URLS.ACCOUNT);
export const cashflowApiClient = createApiClient(SERVICE_BASE_URLS.CASHFLOW);
export const contentApiClient = createApiClient(SERVICE_BASE_URLS.CONTENT);

export default accountApiClient;
