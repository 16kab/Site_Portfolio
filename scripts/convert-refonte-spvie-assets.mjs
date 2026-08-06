// Conversion des captures de la refonte du site SPVIE → webp src/assets.
// Usage : node scripts/convert-refonte-spvie-assets.mjs
import sharp from 'sharp';

const SRC =
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/Site spvie';
const OUT = 'src/assets';

const map = [
  ['homepage - 1.jpg', 'spvie-site-home.webp'],
  ['catégorie - 2.jpg', 'spvie-site-categorie.webp'],
  ['offre - 3.jpg', 'spvie-site-offre.webp'],
];

for (const [src, out] of map) {
  const m = await sharp(`${SRC}/${src}`).metadata();
  await sharp(`${SRC}/${src}`).resize({ width: 1100 }).webp({ quality: 78 }).toFile(`${OUT}/${out}`);
  console.log('✓', out, `${m.width}x${m.height}`);
}
