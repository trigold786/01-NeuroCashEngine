import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(React.createElement(ErrorMessage, { message: 'Something went wrong' }));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(React.createElement(ErrorMessage, { message: 'Error' }));
    expect(screen.queryByText('重试')).not.toBeInTheDocument();
  });

  it('should render retry button and call onRetry on click', () => {
    const onRetry = vi.fn();
    render(React.createElement(ErrorMessage, { message: 'Error', onRetry }));
    const retryBtn = screen.getByText('重试');
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
