require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  try {
    const result = await cloudinary.search
      .expression('folder:pic-portal/docs')
      .sort_by('created_at', 'desc')
      .max_results(5)
      .execute();
      
    console.log("Found assets:");
    result.resources.forEach(r => {
      console.log(`- ${r.resource_type}: ${r.secure_url}`);
    });
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
