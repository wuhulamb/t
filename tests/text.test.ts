import { describe, expect, it } from 'vitest';
import { countCharacters } from '../src/lib/text';

describe('countCharacters', () => {
  it('counts Unicode code points instead of UTF-16 code units', () => {
    expect(countCharacters('abc')).toBe(3);
    expect(countCharacters('中文')).toBe(2);
    expect(countCharacters('😀')).toBe(1);
    expect(countCharacters('a😀中')).toBe(3);
    expect(countCharacters('')).toBe(0);
  });
});
