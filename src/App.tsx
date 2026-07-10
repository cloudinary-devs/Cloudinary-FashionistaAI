import { useCallback, useState } from 'react';
import axios from 'axios';
import './App.css';
import type { CloudinaryImage } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { RecolorModal } from './components/RecolorModal';
import { SourcePreview } from './components/SourcePreview';
import { StyleGrid } from './components/StyleGrid';
import { UploadForm } from './components/UploadForm';
import { buildAllStyleLooks } from './lib/buildStyleLook';
import { buildRecolorLook } from './lib/buildRecolorLook';
import { createCloudinaryClient } from './lib/cloudinaryClient';
import { preloadImage } from './lib/preloadImage';
import { PREVIEW_SIZE, STYLES, type StyleItemKey } from './lib/styles';

const cld = createCloudinaryClient();

function App() {
  const [sourcePreview, setSourcePreview] = useState<CloudinaryImage | null>(null);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<boolean[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [color, setColor] = useState('');
  const [selectedItem, setSelectedItem] = useState<StyleItemKey>('top');
  const [selectedImage, setSelectedImage] = useState(0);
  const [publicId, setPublicId] = useState<string | null>(null);

  const startImagePreload = useCallback((image: CloudinaryImage, index: number) => {
    setLoadingStatus((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    preloadImage(image.toURL())
      .then(() => {
        setLoadingStatus((prev) => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
      })
      .catch((preloadError) => {
        console.error(`Error loading image at index ${index}:`, preloadError);
        setError(
          preloadError instanceof Error
            ? preloadError.message
            : 'Error loading generative image.',
        );
        setLoadingStatus((prev) => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
      });
  }, []);

  const generateImages = useCallback(
    (uploadedPublicId: string) => {
      const genAIImages = buildAllStyleLooks(cld, uploadedPublicId, STYLES);
      setImages(genAIImages);
      setLoadingStatus(genAIImages.map(() => true));
      genAIImages.forEach((image, index) => startImagePreload(image, index));
    },
    [startImagePreload],
  );

  const handleUpload = useCallback(
    async (file: File) => {
      setSourcePreview(null);
      setImages([]);
      setLoadingStatus([]);
      setError('');
      setLoading(true);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post<{ public_id: string }>('/api/generate', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedPublicId = response.data.public_id;
        setPublicId(uploadedPublicId);

        const preview = cld.image(uploadedPublicId);
        preview.resize(fill().width(PREVIEW_SIZE).height(PREVIEW_SIZE));
        setSourcePreview(preview);
        generateImages(uploadedPublicId);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        setError(
          uploadError instanceof Error
            ? `Error uploading image: ${uploadError.message}`
            : 'Error uploading image.',
        );
      } finally {
        setLoading(false);
      }
    },
    [generateImages],
  );

  const handleSelectImage = (index: number) => {
    setSelectedImage(index);
    setOpenModal(true);
  };

  const handleApplyRecolor = () => {
    if (!publicId || !color) {
      return;
    }

    setOpenModal(false);
    const recoloredImage = buildRecolorLook(
      cld,
      publicId,
      STYLES[selectedImage],
      selectedItem,
      color,
    );

    setImages((prev) => {
      const next = [...prev];
      next[selectedImage] = recoloredImage;
      return next;
    });

    startImagePreload(recoloredImage, selectedImage);
  };

  return (
    <div className="app">
      <h1>Fashionista AI</h1>
      <UploadForm onFileSelected={handleUpload} disabled={loading} />
      {loading && <div className="spinner" role="status" aria-label="Uploading" />}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <div className="container">
        {!loading && <SourcePreview image={sourcePreview} />}
        {images.length > 0 && (
          <StyleGrid
            images={images}
            loadingStatus={loadingStatus}
            onSelectImage={handleSelectImage}
          />
        )}
      </div>
      <RecolorModal
        open={openModal}
        selectedItem={selectedItem}
        color={color}
        onClose={() => setOpenModal(false)}
        onItemChange={setSelectedItem}
        onColorChange={setColor}
        onApply={handleApplyRecolor}
      />
    </div>
  );
}

export default App;
