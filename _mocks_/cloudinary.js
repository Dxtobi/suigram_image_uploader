// __mocks__/cloudinary.js
const { mockDeep } = require('jest-mock-extended');

const cloudinary = mockDeep();

cloudinary.uploader.upload_stream.mockImplementation((callback) => {
  callback(null, { url: 'http://fakeurl.com/fakeimage.jpg' });
});

module.exports = cloudinary;
