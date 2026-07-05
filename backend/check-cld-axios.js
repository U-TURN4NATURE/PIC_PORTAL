const axios = require('axios');
const fs = require('fs');

async function download() {
  const url = 'https://res.cloudinary.com/dxvr20qlb/image/upload/v1783014483/pic-portal/docs/document-1783014482908.pdf';
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync('temp.pdf', res.data);
    console.log(`Downloaded size: ${res.data.length} bytes`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    if (e.response) {
      console.error(`Status: ${e.response.status}`);
    }
  }
}
download();
