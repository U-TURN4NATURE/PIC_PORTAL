const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../../frontend/public');

const imagesToCompress = [
  'product_collage.png',
  'women_1.png',
  'women_2.png',
  'women_3.png'
];

async function compressImages() {
  for (const file of imagesToCompress) {
    const inputPath = path.join(publicDir, file);
    const filenameWithoutExt = path.basename(file, path.extname(file));
    const outputPath = path.join(publicDir, `${filenameWithoutExt}.webp`);

    if (fs.existsSync(inputPath)) {
      try {
        console.log(`Compressing ${file}...`);
        await sharp(inputPath)
          .webp({ quality: 80, effort: 6 }) // Convert to WebP with good compression
          .toFile(outputPath);
        console.log(`Successfully created ${filenameWithoutExt}.webp`);
      } catch (err) {
        console.error(`Error compressing ${file}:`, err);
      }
    } else {
      console.log(`File not found: ${inputPath}`);
    }
  }
}

compressImages().then(() => console.log('Done!'));
