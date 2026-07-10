import type { Cloudinary } from '@cloudinary/url-gen';
import type { CloudinaryImage } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import {
  generativeReplace,
  generativeRestore,
  generativeBackgroundReplace,
} from '@cloudinary/url-gen/actions/effect';
import { IMAGE_SIZE, type Style } from './styles';

export function buildStyleLook(
  cld: Cloudinary,
  publicId: string,
  style: Style,
): CloudinaryImage {
  const image = cld.image(publicId);
  image.effect(generativeReplace().from('shirt').to(style.top));
  image.effect(generativeReplace().from('pants').to(style.bottom));
  image.effect(generativeBackgroundReplace().prompt(style.background));
  image.effect(generativeRestore());
  image.resize(fill().width(IMAGE_SIZE).height(IMAGE_SIZE));
  return image;
}

export function buildAllStyleLooks(
  cld: Cloudinary,
  publicId: string,
  styles: Style[],
): CloudinaryImage[] {
  return styles.map((style) => buildStyleLook(cld, publicId, style));
}
