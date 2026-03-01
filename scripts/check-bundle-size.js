import { readdirSync, readFileSync } from 'fs';
import { gzipSync } from 'zlib';

const LIMIT_KB = 150;
const distDir = './dist/assets';

const jsFiles = readdirSync(distDir).filter(f => f.endsWith('.js'));
let totalGzipped = 0;

for (const file of jsFiles) {
  const content = readFileSync(`${distDir}/${file}`);
  const gzipped = gzipSync(content);
  totalGzipped += gzipped.length;
}

const totalKB = (totalGzipped / 1024).toFixed(1);
console.log(`Bundle size: ${totalKB} KB gzipped`);

if (totalGzipped > LIMIT_KB * 1024) {
  console.error(`Bundle exceeds ${LIMIT_KB} KB limit (${totalKB} KB)`);
  process.exit(1);
}
