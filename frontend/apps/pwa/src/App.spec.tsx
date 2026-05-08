import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

vi.mock('@nce/shared', () => ({
  useAuthStore: vi.fn().mockImplementation(() => ({
    isAuthenticated: false,
  })),
}));

describe('App', () => {
  it('renders login page when not authenticated', () => {
    render(<App />);
    expect(screen.getByText('NeuroCashEngine')).toBeInTheDocument();
  });
});