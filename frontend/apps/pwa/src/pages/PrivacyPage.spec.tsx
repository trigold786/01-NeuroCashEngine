import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyPage from './PrivacyPage';

describe('PrivacyPage', () => {
  it('should render privacy policy heading', () => {
    render(React.createElement(PrivacyPage, { navigateTo: () => {} }));
    expect(screen.getByText('隐私政策')).toBeInTheDocument();
  });

  it('should render compliance sections', () => {
    render(React.createElement(PrivacyPage, { navigateTo: () => {} }));
    expect(screen.getByText((c) => c.includes('网络安全法'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('数据安全法'))).toBeInTheDocument();
    expect(screen.getAllByText((c) => c.includes('个人信息保护法')).length).toBeGreaterThan(0);
  });

  it('should render user rights section', () => {
    render(React.createElement(PrivacyPage, { navigateTo: () => {} }));
    expect(screen.getByText((c) => c.includes('知情权'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('访问权'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('更正权'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('删除权'))).toBeInTheDocument();
  });
});
