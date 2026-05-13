import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TermsPage from './TermsPage';

describe('TermsPage', () => {
  it('should render terms of service heading', () => {
    render(React.createElement(TermsPage, { navigateTo: () => {} }));
    expect(screen.getByText('服务条款')).toBeInTheDocument();
  });

  it('should render SLA section', () => {
    render(React.createElement(TermsPage, { navigateTo: () => {} }));
    expect(screen.getByText((c) => c.includes('服务等级协议'))).toBeInTheDocument();
  });
});
