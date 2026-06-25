export const STYLES = [
  {
    top: 'suit jacket for upper body',
    bottom: 'suit pants for lower body',
    background: 'office',
    type: 'business casual',
  },
  {
    top: 'sport tshirt for upper body',
    bottom: 'sport shorts for lower body',
    background: 'gym',
    type: 'sporty',
  },
  {
    top: 'streetwear shirt for upper body',
    bottom: 'streetwear pants for lower body',
    background: 'street',
    type: 'streetwear',
  },
  {
    top: 'elegant tuxedo for upper body',
    bottom: 'elegant tuxedo pants for lower body',
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
