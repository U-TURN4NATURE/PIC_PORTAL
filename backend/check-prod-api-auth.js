const axios = require('axios');
const jwt = require('jsonwebtoken');

// Generate a valid JWT token
const token = jwt.sign(
  { id: 'cmr3ssdbo0000sakcl9qnneqk', role: 'PIC' }, 
  'uturn4nature_pic_portal_jwt_secret_key_2024_secure', // from .env
  { expiresIn: '1h' }
);

async function checkApi() {
  try {
    const res = await axios.get('https://picportal-production-a624.up.railway.app/api/pic/policies', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
checkApi();
