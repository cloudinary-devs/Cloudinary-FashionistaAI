import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import {
  buildAllEagerTransformations,
  sanitizeUploadResponse,
  validateUpload,
} from './server/upload.js';

const app = express();
app.use(express.json());
app.use(cors());

cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.post('/api/generate', upload.single('image'), (req, res) => {
  const validationError = validateUpload(req.file);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      resource_type: 'image',
      public_id: `image_${Date.now()}`,
      eager: buildAllEagerTransformations(),
      eager_async: true,
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(sanitizeUploadResponse(result));
    },
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
