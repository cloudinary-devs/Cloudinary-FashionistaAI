import { describe, expect, it } from 'vitest';
import { createCloudinaryClient } from './cloudinaryClient';
import { buildRecolorLook } from './buildRecolorLook';
import { STYLES } from './styles';

describe('buildRecolorLook', () => {
  const cld = createCloudinaryClient();

  it('appends generative recolor with explicit garment prompt and hex color', () => {
    const image = buildRecolorLook(cld, 'sample-outfit', STYLES[0], 'top', '#ff0000');
    const url = image.toURL();

    expect(url).toContain('gen_recolor');
    expect(url).toContain('shirt');
    expect(url).toMatch(/ff0000/i);
  });

  it('uses pants prompt for bottom recolor', () => {
    const image = buildRecolorLook(cld, 'sample-outfit', STYLES[2], 'bottom', '#00ff00');
    const url = image.toURL();

    expect(url).toContain('pants');
  });
});
