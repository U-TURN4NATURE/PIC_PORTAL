require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const https = require('https');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function runTest() {
  try {
    // 1. Create a dummy 1-page PDF
    const pdfBase64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1DMyAQsXcqJzE3FQg29jUwtjQwMDUwBTEswSywIIMYACVaw0vCmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKNDcKZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1IDg0Ml0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDEgMCBSPj4+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNSAwIFI+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzQgMCBSXT4+CmVuZG9iagoKNiAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNSAwIFI+PgplbmRvYmoKCjcgMCBvYmoKPDwvUHJvZHVjZXIoaUdvcmQpL0NyZWF0aW9uRGF0ZShEOjIwMjExMTE1MTgyNzQ4KzAyJzAwJyk+PgplbmRvYmoKCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDIxOSAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAxNDYgMDAwMDAgbiAKMDAwMDAwMDE2NyAwMDAwMCBuIAowMDAwMDAwMjg3IDAwMDAwIG4gCjAwMDAwMDAzNDYgMDAwMDAgbiAKMDAwMDAwMDM5NSAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOC9Sb290IDYgMCBSL0luZm8gNyAwIFI+PgpzdGFydHhyZWYKNDc0CiUlRU9GCg==";
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    fs.writeFileSync('temp.pdf', pdfBuffer);

    // 2. Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    const res = await cloudinary.uploader.upload('temp.pdf', {
      folder: 'pic-portal/docs',
      resource_type: 'auto',
      public_id: `test-api-${Date.now()}`
    });
    
    console.log("Upload Success! URL:", res.secure_url);
    
    // 3. Download from Cloudinary
    console.log("Downloading from Cloudinary...");
    https.get(res.secure_url, (response) => {
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
      });
      response.on('end', () => {
        console.log(`Downloaded size: ${size} bytes`);
        if (size > 100000) {
          console.log("WTF! Cloudinary returned a giant PDF for a 1-page upload!");
        } else {
          console.log("Normal behavior. Cloudinary returned the exact 1-page PDF.");
        }
      });
    }).on('error', (e) => {
      console.error(e);
    });
    
  } catch(e) {
    console.error(e);
  }
}

runTest();
