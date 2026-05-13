import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from './Login';

describe('Login', () => {
  it('should render login form with email and password fields', () => {
    render(React.createElement(Login));
    expect(screen.getByText('邮箱')).toBeInTheDocument();
    expect(screen.getByText('密码')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(React.createElement(Login));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render form with h2 title', () => {
    render(React.createElement(Login));
    const h2Elements = screen.getAllByText('登录');
    expect(h2Elements.length).toBeGreaterThan(0);
    expect(h2Elements[0].tagName).toBe('H2');
  });
});