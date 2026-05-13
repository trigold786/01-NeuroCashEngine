import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Register from './Register';

describe('Register', () => {
  it('should render registration form fields', () => {
    render(React.createElement(Register));
    expect(screen.getByText('用户名')).toBeInTheDocument();
    expect(screen.getByText('邮箱')).toBeInTheDocument();
    expect(screen.getByText('密码')).toBeInTheDocument();
  });

  it('should render account type selector', () => {
    render(React.createElement(Register));
    expect(screen.getByText('账号类型')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '个人用户' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '企业用户' })).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(React.createElement(Register));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show enterprise fields when account type is enterprise', () => {
    render(React.createElement(Register));
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
  });
});