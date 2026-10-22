import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../lib/utils';

describe('Frontend Utilities: cn() Unit Tests', () => {
  it('concatenates simple class names', () => {
    assert.equal(cn('px-4', 'py-2'), 'px-4 py-2');
  });

  it('filters out falsy and undefined values', () => {
    assert.equal(cn('btn', false, null, undefined, 0, 'btn-primary'), 'btn btn-primary');
  });

  it('supports conditional object syntax', () => {
    assert.equal(
      cn('card', {
        'bg-dark': true,
        'border-red': false,
        'shadow-md': true,
      }),
      'card bg-dark shadow-md'
    );
  });

  it('handles nested arrays of class names', () => {
    assert.equal(cn(['flex', ['items-center', 'justify-between']]), 'flex items-center justify-between');
  });

  it('handles empty inputs', () => {
    assert.equal(cn(), '');
  });
});
