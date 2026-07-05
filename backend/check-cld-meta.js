require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function checkMetadata() {
  try {
    const res = await cloudinary.api.resource('pic-portal/docs/document-1783015917432');
    console.log("Size in bytes:", res.bytes);
    console.log("Pages:", res.pages);
    console.log("Format:", res.format);
  } catch(e) {
    console.error(e);
  }
}
checkMetadata();
