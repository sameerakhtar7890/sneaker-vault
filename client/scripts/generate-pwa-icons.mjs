/**
 * Generates PNG icons from public/logo.svg for the PWA manifest.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const src = path.join(publicDir, 'logo.svg');

async function run() {
  await sharp(src).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192.png'));
  await sharp(src).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512.png'));
  await sharp(src).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('PWA icons generated in client/public/');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
