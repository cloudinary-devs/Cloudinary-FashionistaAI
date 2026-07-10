import { Cloudinary } from '@cloudinary/url-gen';

const DEFAULT_CLOUD_NAME = 'fashionista-ai';

export function createCloudinaryClient(): Cloudinary {
  return new Cloudinary({
    cloud: {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME,
    },
  });
}
