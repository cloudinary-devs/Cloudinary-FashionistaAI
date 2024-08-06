/* eslint-disable no-undef */
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Configure Cloudinary with secure URLs and credentials
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define a POST endpoint to handle image upload
app.post('/api/generate', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {resource_type: "image"},
     async (error, result) => {
      if (error) {
        console.error('Cloudinary error:', error);
        return res.status(500).json({ error: error.message });
      }
      const resObj = {
        public_id: result.public_id,
      }
      res.json(resObj);
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});


app.use(express.static(path.resolve(__dirname, "public")));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});