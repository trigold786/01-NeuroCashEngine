import { describe, it, expect } from 'vitest';

describe('Simple Tests', () => {
  it('adds 1 + 1 to equal 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('checks true is true', () => {
    expect(true).toBe(true);
  });
});
