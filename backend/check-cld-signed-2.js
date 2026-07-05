require('dotenv').config({ path: '.env' });
const cloudinary = require('cloudinary').v2;
const https = require('https');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const public_id = 'pic-portal/docs/document-1783015917432';
const signedUrl = cloudinary.utils.url(public_id, { sign_url: true, secure: true, resource_type: 'image' });

console.log('Signed URL:', signedUrl);

https.get(signedUrl, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  res.destroy();
}).on('error', console.error);
