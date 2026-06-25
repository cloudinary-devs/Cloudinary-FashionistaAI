import type { Cloudinary } from '@cloudinary/url-gen';
import type { CloudinaryImage } from '@cloudinary/url-gen';
import { generativeRecolor } from '@cloudinary/url-gen/actions/effect';
import { buildStyleLook } from './buildStyleLook';
import { RECOLOR_PROMPTS, type Style, type StyleItemKey } from './styles';

export function buildRecolorLook(
  cld: Cloudinary,
  publicId: string,
  style: Style,
  item: StyleItemKey,
  color: string,
): CloudinaryImage {
  const image = buildStyleLook(cld, publicId, style);
  image.effect(generativeRecolor(RECOLOR_PROMPTS[item], color));
  return image;
}
