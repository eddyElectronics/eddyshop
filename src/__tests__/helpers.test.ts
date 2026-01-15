import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  calculateShipping,
  amountForFreeShipping,
  truncate,
  isEmpty,
  cn,
  slugify,
  generateId,
  safeJsonParse,
} from '../utils/helpers';

describe('formatPrice', () => {
  it('formats price in Thai Baht', () => {
    expect(formatPrice(1000)).toContain('1,000');
    expect(formatPrice(0)).toContain('0');
    expect(formatPrice(999)).toContain('999');
  });
});

describe('calculateShipping', () => {
  it('returns 0 for orders >= 1000', () => {
    expect(calculateShipping(1000)).toBe(0);
    expect(calculateShipping(2000)).toBe(0);
  });

  it('returns shipping fee for orders < 1000', () => {
    expect(calculateShipping(500)).toBe(50);
    expect(calculateShipping(0)).toBe(50);
  });
});

describe('amountForFreeShipping', () => {
  it('returns remaining amount needed', () => {
    expect(amountForFreeShipping(800)).toBe(200);
    expect(amountForFreeShipping(500)).toBe(500);
  });

  it('returns 0 when threshold is met', () => {
    expect(amountForFreeShipping(1000)).toBe(0);
    expect(amountForFreeShipping(1500)).toBe(0);
  });
});

describe('truncate', () => {
  it('truncates long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('does not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });
});

describe('isEmpty', () => {
  it('returns true for empty values', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  it('returns false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out falsy values', () => {
    expect(cn('a', false, 'b', null, 'c', undefined)).toBe('a b c');
  });
});

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Test  123')).toBe('test-123');
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('invalid', { default: true })).toEqual({ default: true });
  });
});
