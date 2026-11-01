import { describe, expect, it } from 'vitest';
import { getDesignation } from './designation';

describe('getDesignation', () => {
  it('isConditional=falseなら特定外来生物の定義を返す', () => {
    const d = getDesignation(false);
    expect(d.label).toBe('特定外来生物');
    expect(d.colorPalette).toBe('red');
  });

  it('isConditional=trueなら条件付特定外来生物の定義を返す', () => {
    const d = getDesignation(true);
    expect(d.label).toBe('条件付特定外来生物');
    expect(d.shortLabel).toBe('条件付');
    expect(d.colorPalette).toBe('orange');
  });
});
