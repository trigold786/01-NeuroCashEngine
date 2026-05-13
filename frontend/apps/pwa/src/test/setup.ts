import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@nce/shared', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  })),
  AccountType: {
    INDIVIDUAL: 'individual',
    ENTERPRISE: 'enterprise',
  },
}));