const https = require('https');
const fs = require('fs');

const url = 'https://res.cloudinary.com/dxvr20qlb/image/upload/v1783015917/pic-portal/docs/document-1783015917432.pdf';

https.get(url, (res) => {
  let data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    fs.writeFileSync('downloaded-mystery.pdf', buffer);
    console.log(`Downloaded ${buffer.length} bytes`);
    if (buffer.toString('utf8').includes('Failed to load') || buffer.length < 1000) {
      console.log('It is a small file or error page.');
    } else {
      console.log('It is a giant file!');
    }
  });
}).on('error', console.error);
