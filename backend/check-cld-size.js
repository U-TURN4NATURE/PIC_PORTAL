const https = require('https');

const url = 'https://res.cloudinary.com/dxvr20qlb/image/upload/v1783012041/pic-portal/docs/document-1783012040898.pdf';

https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let size = 0;
  res.on('data', (chunk) => {
    size += chunk.length;
  });
  res.on('end', () => {
    console.log(`Downloaded size: ${size} bytes`);
  });
}).on('error', (e) => {
  console.error(e);
});
