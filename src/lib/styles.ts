import {
  STYLES,
  RECOLOR_PROMPTS,
  IMAGE_SIZE,
  PREVIEW_SIZE,
} from '../../shared/styles.js';

export { STYLES, RECOLOR_PROMPTS, IMAGE_SIZE, PREVIEW_SIZE };

export type Style = (typeof STYLES)[number];
export type StyleItemKey = keyof typeof RECOLOR_PROMPTS;
