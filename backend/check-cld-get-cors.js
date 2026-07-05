const https = require('https');

const options = {
  hostname: 'res.cloudinary.com',
  path: '/dxvr20qlb/image/upload/v1783015917/pic-portal/docs/document-1783015917432.pdf',
  method: 'GET',
  headers: {
    'Origin': 'https://pic.u-turn.in'
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  // abort to not download the whole thing
  res.destroy();
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
