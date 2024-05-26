const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const toStream = require('buffer-to-stream');
require('dotenv').config();

const app = express();
const port = 3000;

cloudinary.config({
  cloud_name: 'jaofiles',
  api_key: process.env.CLOUDINARY_KEY_API,
  api_secret: process.env.CLOUDINARY_KEY_SECR,
  secure: true,
});

const upload = multer();

async function uploadImageToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream((error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    const readableStream = toStream(fileBuffer);
    readableStream.pipe(upload);
  });
}

app.post('/api/upload-img', upload.single('image'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const result = await uploadImageToCloudinary(buffer);
    res.status(200).json({ url: result.url });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed. Please try again' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
