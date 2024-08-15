import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
import { generativeReplace } from '@cloudinary/url-gen/actions/effect';

const App: React.FC = () => {
  const [image, setImage] = useState<any | null>(null);
  const [images, setImages] = useState<any | null>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [shouldSubmit, setShouldSubmit] = useState<boolean>(false);

  const cld = new Cloudinary({
    cloud: {
      cloudName: 'fashionista-ai',
    },
  });

  useEffect(() => {
    if (shouldSubmit && image) {
      handleSubmit();
    }
  }, [shouldSubmit, image]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setShouldSubmit(true);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      alert('Please select an image to upload');
      setShouldSubmit(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      setLoading(true);
      const response = await axios.post('/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      generateImages(response.data.public_id);
      setLoading(false);
      setError(''); // Clear any previous error messages
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image: ' + (error as Error).message);
      setLoading(false);
    } finally {
      setShouldSubmit(false);
      setLoading(false);
    }
  };

  const generateImages = (publicId: string) => {
    const genAIImages: CloudinaryImage[] = [];
    const styles = [
      { shirt: "suit_jacket", pants: "suit_pants" },
      { shirt: "sport_shirt", pants: "sport_shorts" },
      { shirt: "streetwear_shirt", pants: "streetwear_pants" },
      { shirt: "elegant_tuxedo", pants: "elegant_tuxedo_pants" },
    ];
  
    styles.map((style) => {
      const image = cld.image(publicId);
      image.effect(generativeReplace().from("shirt").to(style.shirt));
      image.effect(generativeReplace().from("pants").to(style.pants));
      image.resize(fill().width(500).height(500));
      genAIImages.push(image);
    });

    setImages(genAIImages);
  };
  

  useEffect(() => {
    console.log('Updated images array:', images); // Log after images state is updated
  }, [images]);

  return (
    <div className="app">
      <h1>Fashionista AI</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <label className="custom-file-upload">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          Choose File
        </label>
      </form>
      {loading && <div className="spinner"></div>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {image && !loading && <AdvancedImage cldImg={image} />}
      <div className="grid-container">
        {images.map(image => (
          <AdvancedImage cldImg={image} />
        ))}
      </div>
    </div>
  );
};

export default App;
