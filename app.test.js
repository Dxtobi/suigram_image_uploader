const request = require('supertest');
const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const toStream = require('buffer-to-stream');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

jest.mock('cloudinary');

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

describe('POST /api/upload-img', () => {
  it('should upload image to Cloudinary and return URL', async () => {
    cloudinary.uploader.upload_stream.mockImplementation((callback) => {
      callback(null, { url: 'http://fakeurl.com/fakeimage.jpg' });
    });

    const imagePath = path.join(__dirname, 'test-image.jpg');
    const imageBuffer = fs.readFileSync(imagePath);

    const response = await request(app)
      .post('/api/upload-img')
      .attach('image', imageBuffer, 'test-image.jpg');

    expect(response.status).toBe(200);
    expect(response.body.url).toBe('http://fakeurl.com/fakeimage.jpg');
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
