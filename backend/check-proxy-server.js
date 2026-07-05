require('dotenv').config({ path: '../.env' });
const express = require('express');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.get('/proxy', (req, res) => {
  const url = 'https://res.cloudinary.com/dxvr20qlb/image/upload/v1783015917/pic-portal/docs/document-1783015917432.pdf';
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
  const publicId = match[1];
  
  const signedUrl = cloudinary.utils.url(publicId, {
    sign_url: true,
    secure: true,
    resource_type: 'image', // standard for auto PDFs in cloudinary
    format: 'pdf' // to ensure it requests the pdf extension
  });
  
  console.log('Redirecting to:', signedUrl);
  res.redirect(signedUrl);
});

app.listen(8080, async () => {
  console.log('Server started on 8080');
  try {
    const res = await axios.get('http://localhost:8080/proxy', { responseType: 'arraybuffer' });
    console.log('Downloaded size:', res.data.length);
  } catch (e) {
    console.error('Failed:', e.response ? e.response.status : e.message);
  }
  process.exit(0);
});
