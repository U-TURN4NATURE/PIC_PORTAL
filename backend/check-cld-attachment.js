const https = require('https');

const options = {
  hostname: 'res.cloudinary.com',
  path: '/dxvr20qlb/image/upload/fl_attachment/v1783015917/pic-portal/docs/document-1783015917432.pdf',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.destroy();
});

req.on('error', (e) => console.error(e));
req.end();
