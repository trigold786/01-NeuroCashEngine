import { describe, it, expect } from 'vitest';

describe('Simple Tests', () => {
  it('adds 1 + 1 to equal 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('checks true is true', () => {
    expect(true).toBe(true);
  });

  it('checks false is false', () => {
    expect(false).toBe(false);
  });

  it('array operations work correctly', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.push(4)).toBe(4);
  });

  it('object operations work correctly', () => {
    const obj = { name: 'test', value: 100 };
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(100);
  });
});