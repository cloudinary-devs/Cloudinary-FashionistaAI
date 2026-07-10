import { describe, expect, it } from 'vitest';
import { createCloudinaryClient } from '../lib/cloudinaryClient';
import { buildStyleLook } from '../lib/buildStyleLook';
import { STYLES } from '../lib/styles';

describe('buildStyleLook', () => {
  const cld = createCloudinaryClient();

  it('builds a URL with generative replace, background replace, restore, and fill', () => {
    const image = buildStyleLook(cld, 'sample-outfit', STYLES[0]);
    const url = image.toURL();

    expect(url).toContain('gen_replace');
    expect(url).toContain('gen_background_replace');
    expect(url).toContain('gen_restore');
    expect(url).toContain('c_fill');
    expect(url).toContain('w_500');
    expect(url).toContain('h_500');
  });

  it('includes style-specific background prompt', () => {
    const image = buildStyleLook(cld, 'sample-outfit', STYLES[1]);
    const url = image.toURL();

    expect(url).toContain('gym');
    expect(url).toContain('sport');
  });
});
