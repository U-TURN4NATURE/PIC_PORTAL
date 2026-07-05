const axios = require('axios');

async function checkAxios() {
  try {
    const res = await axios.get('https://res.cloudinary.com/dxvr20qlb/image/upload/v1783015917/pic-portal/docs/document-1783015917432.pdf', {
      responseType: 'blob',
      withCredentials: true,
      headers: {
        'Origin': 'https://pic.u-turn.in',
        'Authorization': 'Bearer asdf',
        'Content-Type': 'application/json'
      }
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data.length || res.data.size);
  } catch (e) {
    console.log('Error:', e.message);
    if (e.response) {
      console.log('Status:', e.response.status);
    }
  }
}
checkAxios();
