const axios = require('axios');

async function checkApi() {
  try {
    const res = await axios.get('http://localhost:5000/api/pic/policies');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
checkApi();
