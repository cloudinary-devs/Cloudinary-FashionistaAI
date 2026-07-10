import { describe, expect, it } from 'vitest';
import {
  STYLES,
  buildAllEagerTransformations,
  buildEagerTransformations,
  validateUpload,
  sanitizeUploadResponse,
  MAX_FILE_SIZE_BYTES,
} from '../server/upload.js';

describe('server upload helpers', () => {
  it('validates missing files', () => {
    expect(validateUpload(undefined)).toBe('Image file is required');
  });

  it('rejects unsupported mime types', () => {
    expect(
      validateUpload({ mimetype: 'application/pdf', size: 1000 }),
    ).toBe('Only JPEG, PNG, WebP, and GIF images are allowed');
  });

  it('rejects files over 5 MB', () => {
    expect(
      validateUpload({
        mimetype: 'image/png',
        size: MAX_FILE_SIZE_BYTES + 1,
      }),
    ).toBe('Image must be 5 MB or smaller');
  });

  it('accepts valid image uploads', () => {
    expect(
      validateUpload({ mimetype: 'image/jpeg', size: 1024 }),
    ).toBeNull();
  });

  it('returns only public_id and secure_url', () => {
    expect(
      sanitizeUploadResponse({
        public_id: 'abc',
        secure_url: 'https://example.com/abc.jpg',
        api_key: 'secret',
      }),
    ).toEqual({
      public_id: 'abc',
      secure_url: 'https://example.com/abc.jpg',
    });
  });

  it('builds eager transformations for every style', () => {
    expect(buildAllEagerTransformations()).toHaveLength(STYLES.length);
  });

  it('includes generative effects in eager chain', () => {
    const [firstStep] = buildEagerTransformations(STYLES[0]);
    const effects = buildEagerTransformations(STYLES[0]).map((step) => step.effect).filter(Boolean);

    expect(firstStep.effect).toContain('gen_replace');
    expect(effects).toContain('gen_restore');
    expect(effects.some((effect) => effect.includes('gen_background_replace'))).toBe(true);
  });
});
