export const STYLES = [
  {
    top: 'suit_jacket',
    bottom: 'suit_pants',
    background: 'office',
    type: 'business casual',
  },
  {
    top: 'sport_tshirt',
    bottom: 'sport_shorts',
    background: 'gym',
    type: 'sporty',
  },
  {
    top: 'streetwear_shirt',
    bottom: 'streetwear_pants',
    background: 'street',
    type: 'streetwear',
  },
  {
    top: 'elegant_tuxedo',
    bottom: 'elegant_tuxedo_pants',
    background: 'gala',
    type: 'elegant',
  },
];

export const RECOLOR_PROMPTS = {
  top: 'shirt',
  bottom: 'pants',
};

export const IMAGE_SIZE = 500;
export const PREVIEW_SIZE = 500;

/** Cloudinary upload API eager transformation steps for a style look. */
export function buildEagerTransformations(style) {
  return [
    { effect: `gen_replace:from_shirt;to_${style.top}` },
    { effect: `gen_replace:from_pants;to_${style.bottom}` },
    { effect: `gen_background_replace:prompt_${style.background}` },
    { effect: 'gen_restore' },
    { width: IMAGE_SIZE, height: IMAGE_SIZE, crop: 'fill' },
  ];
}

export function buildAllEagerTransformations() {
  return STYLES.map((style) => ({
    transformation: buildEagerTransformations(style),
  }));
}
