const https = require('https');

const options = {
  hostname: 'res.cloudinary.com',
  path: '/dxvr20qlb/image/upload/v1783015917/pic-portal/docs/document-1783015917432.pdf',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://pic.u-turn.in',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'authorization, content-type'
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
