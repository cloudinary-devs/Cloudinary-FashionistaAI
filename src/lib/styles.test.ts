import { describe, expect, it } from 'vitest';
import { STYLES, RECOLOR_PROMPTS, IMAGE_SIZE } from './styles';

describe('styles', () => {
  it('defines exactly four outfit styles', () => {
    expect(STYLES).toHaveLength(4);
  });

  it('includes required keys on every style', () => {
    for (const style of STYLES) {
      expect(style).toMatchObject({
        top: expect.any(String),
        bottom: expect.any(String),
        background: expect.any(String),
        type: expect.any(String),
      });
    }
  });

  it('maps recolor items to garment detection prompts', () => {
    expect(RECOLOR_PROMPTS).toEqual({
      top: 'shirt',
      bottom: 'pants',
    });
  });

  it('uses a square image size for generated looks', () => {
    expect(IMAGE_SIZE).toBe(500);
  });
});
