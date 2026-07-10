import { AdvancedImage } from '@cloudinary/react';
import type { CloudinaryImage } from '@cloudinary/url-gen';

interface SourcePreviewProps {
  image: CloudinaryImage | null;
}

export function SourcePreview({ image }: SourcePreviewProps) {
  if (!image) {
    return null;
  }

  return (
    <div className="source-preview">
      <p className="style-label">Uploaded look</p>
      <AdvancedImage cldImg={image} className="style-image source-image" />
    </div>
  );
}
