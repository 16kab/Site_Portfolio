import { describe, expect, it } from 'vitest';
import { getCharacterMaskPadding } from './Shuffle';

describe('getCharacterMaskPadding', () => {
  it('scales with large glyphs while staying bounded', () => {
    expect(getCharacterMaskPadding(25)).toBe(4);
    expect(getCharacterMaskPadding(150)).toBe(6);
    expect(getCharacterMaskPadding(400)).toBe(12);
  });
});
