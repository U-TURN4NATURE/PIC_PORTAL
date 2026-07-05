const axios = require('axios');
const fs = require('fs');

async function download() {
  const url = 'https://res.cloudinary.com/dxvr20qlb/image/upload/v1783015271/pic-portal/docs/document-1783015271200.pdf';
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    fs.writeFileSync('downloaded_test.pdf', res.data);
    console.log(`Downloaded size: ${res.data.length} bytes`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    if (e.response) {
      console.error(`Status: ${e.response.status}`);
      console.error(`Data: ${e.response.data.toString()}`);
    }
  }
}
download();
