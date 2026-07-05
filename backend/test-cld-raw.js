require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function upload() {
  try {
    fs.writeFileSync('dummy.pdf', 'dummy content');
    const res = await cloudinary.uploader.upload('dummy.pdf', {
      resource_type: 'raw',
      folder: 'pic-portal/docs',
      public_id: `test-raw-${Date.now()}.pdf`
    });
    console.log(res);
  } catch(e) {
    console.error(e);
  }
}
upload();
