import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Skeleton, { CardSkeleton, ChartSkeleton, StepSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render basic skeleton', () => {
    const { container } = render(React.createElement(Skeleton));
    expect(container.firstChild).toBeDefined();
  });

  it('should render card skeleton', () => {
    const { container } = render(React.createElement(CardSkeleton));
    expect(container.firstChild).toBeDefined();
  });

  it('should render chart skeleton', () => {
    const { container } = render(React.createElement(ChartSkeleton));
    expect(container.firstChild).toBeDefined();
  });

  it('should render step skeleton', () => {
    const { container } = render(React.createElement(StepSkeleton));
    expect(container.firstChild).toBeDefined();
  });
});
