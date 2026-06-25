import { AdvancedImage } from '@cloudinary/react';
import type { CloudinaryImage } from '@cloudinary/url-gen';
import { STYLES } from '../lib/styles';

interface StyleGridProps {
  images: CloudinaryImage[];
  loadingStatus: boolean[];
  onSelectImage: (index: number) => void;
}

export function StyleGrid({ images, loadingStatus, onSelectImage }: StyleGridProps) {
  return (
    <div className="grid-container">
      {images.map((image, index) => (
        <div key={STYLES[index]?.type ?? index} className="grid-item">
          <p className="style-label">{STYLES[index]?.type}</p>
          <div className="grid-image-wrapper">
            {loadingStatus[index] ? (
              <div className="spinner" role="status" aria-label="Loading style" />
            ) : (
              <AdvancedImage
                cldImg={image}
                className="style-image"
                onClick={() => onSelectImage(index)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
