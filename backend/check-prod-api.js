const axios = require('axios');

async function fetchProd() {
  try {
    const res = await axios.get('https://picportal-production-a624.up.railway.app/api/pic/policies');
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error(e.message);
  }
}
fetchProd();
