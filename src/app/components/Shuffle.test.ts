import { describe, expect, it } from 'vitest';
import { getCharacterMaskPadding } from './Shuffle';

describe('getCharacterMaskPadding', () => {
  it('keeps the original mask geometry unless padding is explicitly enabled', () => {
    expect(getCharacterMaskPadding(150, false)).toBe(0);
  });

  it('scales with large glyphs while staying bounded when enabled', () => {
    expect(getCharacterMaskPadding(25, true)).toBe(4);
    expect(getCharacterMaskPadding(150, true)).toBe(6);
    expect(getCharacterMaskPadding(400, true)).toBe(12);
  });
});
