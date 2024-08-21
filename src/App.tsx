import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
import {
  generativeReplace,
  generativeRecolor,
  generativeRestore,
  generativeBackgroundReplace,
} from '@cloudinary/url-gen/actions/effect';

const App: React.FC = () => {
  const [image, setImage] = useState<any | null>(null);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<boolean[]>([]); // Track loading status for each image
  const [shouldSubmit, setShouldSubmit] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [color, setColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const styles = [
    { shirt: 'suit jacket for upper body', pants: 'suit pants for lower body', background: 'office', type: 'business casual' },
    { shirt: 'sport tshirt for upper body', pants: 'sport shorts for lower body', background: 'gym', type: 'sporty' },
    { shirt: 'streetwear shirt for upper body', pants: 'streetwear pants for lower body', background: 'street', type: 'streetwear' },
    { shirt: 'elegant tuxedo for upper body', pants: 'elegant tuxedo pants for lower body', background: 'gala', type: 'elegant' },
  ];

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
    setImage(null);
    setImages([]);
    setLoadingStatus([]);
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
      const image = cld.image(response.data.public_id);
      image.resize(fill().width(508).height(508));
      setImage(image);
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

  const handleImageLoading = (image: CloudinaryImage, index: number, attempts = 0) => {
    const url = image.toURL();
    const img = new Image();
    img.src = url;

    img.onload = () => {
      setLoadingStatus((prev) => {
        const newStatus = [...prev];
        newStatus[index] = false; // Image has finished loading
        return newStatus;
      });
    };

    img.onerror = async () => {
      console.error(`Error loading image at index ${index}, Attempt ${attempts + 1}`);

      // Check if 423 status was returned (this requires you to use a proxy server or inspect headers)
      const response = await fetch(url);
      if (response.status === 423) {
        console.log(`423 error received. Retrying image load in 5 seconds... (Attempt ${attempts + 1})`);
        setTimeout(() => handleImageLoading(image, index, attempts + 1), 5000);
      } else {
        console.error('Max retries reached or non-423 error. Image failed to load.');
        setError('Error loading image. Max retries reached.');
        setLoadingStatus((prev) => {
          const newStatus = [...prev];
          newStatus[index] = false; // Stop spinner even if loading fails
          return newStatus;
        });
      }
    };
  };

  const generateImages = (publicId: string) => {
    const genAIImages: CloudinaryImage[] = [];
    const newLoadingStatus: boolean[] = [];

    styles.forEach((style, index) => {
      const image = cld.image(publicId);
      image.effect(generativeReplace().from('shirt').to(style.shirt));
      image.effect(generativeReplace().from('pants').to(style.pants));
      image.effect(generativeBackgroundReplace().prompt(style.background));
      image.effect(generativeRestore());
      image.resize(fill().width(500).height(500));
      genAIImages.push(image);
      newLoadingStatus.push(true); // Set initial loading status
      handleImageLoading(image, index); // Start loading image
    });

    setImages(genAIImages);
    setLoadingStatus(newLoadingStatus);
  };

  const onHandleSelectImage = (index: number) => {
    setOpenModal(!openModal);
    setSelectedImage(index);
  };

  const onHandleChangeItemsColor = () => {
    const genAIImagesCopy = [...images];
    const tempImage = genAIImagesCopy[selectedImage];

    // Show spinner and hide modal
    setLoadingStatus((prev) => {
      const newStatus = [...prev];
      newStatus[selectedImage] = true; // Set loading to true for the selected image
      return newStatus;
    });
    setOpenModal(false); // Close the modal

    // Change color
    tempImage.effect(generativeRecolor(styles[selectedImage].shirt, color));

    // Once done, update state and hide spinner
    setImages(genAIImagesCopy);
    handleImageLoading(tempImage, selectedImage); // Trigger reloading of the image
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
      <div className="container">
        {image && !loading && <AdvancedImage cldImg={image} />}
        <div className="grid-container">
          {images.map((image: CloudinaryImage, index: number) => (
            <div key={index}>
              {loadingStatus[index] ? (
                <div className="spinner"></div>
              ) : (
                <AdvancedImage cldImg={image} onClick={() => onHandleSelectImage(index)} />
              )}
            </div>
          ))}
        </div>
      </div>
      {openModal && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="close-icon" onClick={() => setOpenModal(false)}>
              &times;
            </span>
            <h2>Pick A Color</h2>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            {color && <button onClick={onHandleChangeItemsColor}>Change Item Color</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
