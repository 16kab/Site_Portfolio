// Conversion one-off des écrans SYMA (PNG OneDrive) → webp src/assets.
// Usage : node scripts/convert-syma-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC =
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/SYMA';
const OUT = 'src/assets';
mkdirSync(OUT, { recursive: true });

const map = [
  ['iconographies.png', 'syma-iconographie.webp'],
  ['Typographies.png', 'syma-typographies.webp'],
  ['Valider.png', 'syma-valider.webp'],
];

for (const [src, out] of map) {
  await sharp(`${SRC}/${src}`)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${out}`);
  console.log('✓', out);
}
