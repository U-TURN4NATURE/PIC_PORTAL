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
    console.log("RAW RESPONSE:");
    console.log(data);
  });
}).on('error', console.error);
