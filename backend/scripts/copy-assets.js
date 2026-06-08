// scripts/copy-assets.js
// Copies non-TypeScript assets (PDFs, images, etc.) from src/ to dist/ after tsc build.
// Runs on both Linux (Railway) and Windows.
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`[copy-assets] Source not found, skipping: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`[copy-assets] Copied: ${srcPath} → ${destPath}`);
    }
  }
}

const srcAssets = path.resolve(__dirname, '../src/assets');
const distAssets = path.resolve(__dirname, '../dist/assets');

copyDir(srcAssets, distAssets);
console.log('[copy-assets] Done.');
