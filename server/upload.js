import { STYLES, buildAllEagerTransformations, buildEagerTransformations, RECOLOR_PROMPTS, IMAGE_SIZE } from '../shared/styles.js';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function validateUpload(file) {
  if (!file) {
    return 'Image file is required';
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return 'Only JPEG, PNG, WebP, and GIF images are allowed';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Image must be 5 MB or smaller';
  }

  return null;
}

export function sanitizeUploadResponse(result) {
  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
  };
}

export {
  STYLES,
  buildAllEagerTransformations,
  buildEagerTransformations,
  RECOLOR_PROMPTS,
  IMAGE_SIZE,
};
