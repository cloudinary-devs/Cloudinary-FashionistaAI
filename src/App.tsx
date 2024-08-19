import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
import { generativeReplace, generativeRecolor, generativeRestore, generativeBackgroundReplace } from '@cloudinary/url-gen/actions/effect';

const App: React.FC = () => {
  const [image, setImage] = useState<any | null>(null);
  const [images, setImages] = useState<any | null>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [shouldSubmit, setShouldSubmit] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [color, setColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const styles = [
    { shirt: "suit jacket", pants: "suit pants", background: "office", type: "business casual" },
    { shirt: "sport tshirt", pants: "sport shorts",  background: "gym", type: "sporty" },
    { shirt: "streetwear shirt", pants: "streetwear pants",  background: "street", type: "streetwear" },
    { shirt: "elegant tuxedo", pants: "elegant tuxedo pants",  background: "gala", type: "elegant" },
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

  const generateImages = (publicId: string) => {
    const genAIImages: CloudinaryImage[] = [];
  
    styles.map((style) => {
      const image = cld.image(publicId);   
      image.effect(generativeReplace().from("shirt").to(style.shirt));
      image.effect(generativeReplace().from("pants").to(style.pants));
      image.effect(generativeBackgroundReplace().prompt(style.background));
      image.effect(generativeRestore());
      image.resize(fill().width(500).height(500));
      genAIImages.push(image);
    });

    setImages(genAIImages);
  };

  const onHandleSelectImage = (index: number) => {
    setOpenModal(!openModal);
    setSelectedImage(index);
  }

  const onHandleChangeItemsColor =() => {
    const genAIImagesCopy = [...images];
    console.log(genAIImagesCopy);
    const tempImage = genAIImagesCopy[selectedImage];
    tempImage.effect(generativeRecolor(styles[selectedImage].shirt, color));
    setImages(genAIImagesCopy);
  }

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
            <AdvancedImage cldImg={image} onClick={()=>onHandleSelectImage(index)}/>
          ))}
        </div>
      </div>
      {openModal && (
        <div className="modal-overlay">
        <div className="modal">
          <span className="close-icon" onClick={()=>setOpenModal(false)}>&times;</span>
          <h2>Pick A Color</h2>
          <input type="color" value={color} onChange={(e)=>setColor(e.target.value)}/>
          <button onClick={onHandleChangeItemsColor}>Change Item Color</button>
        </div>
      </div>
      )}
    </div>
  );
};

export default App;
