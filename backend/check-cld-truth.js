const https = require('https');
require('dotenv').config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

const options = {
  hostname: 'api.cloudinary.com',
  path: `/v1_1/${cloudName}/resources/image/upload/pic-portal/docs/document-1783015917432`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Cloudinary File Metadata:");
      console.log("Format:", json.format);
      console.log("Bytes:", json.bytes);
      console.log("Pages:", json.pages);
      console.log("Created At:", json.created_at);
      
      if (json.bytes > 100000) {
        console.log("CONCLUSION: The file on Cloudinary is HUGE (>100KB). The user uploaded the 24-page PDF.");
      } else {
        console.log("CONCLUSION: The file on Cloudinary is SMALL. Something is extremely wrong with the frontend.");
      }
    } catch(e) {
      console.log("Raw response:", data);
    }
  });
}).on('error', console.error);
