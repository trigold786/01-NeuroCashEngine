import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nce_access_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('nce_access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
