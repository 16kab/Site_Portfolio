// Conversion one-off des captures TrackIt (JPG OneDrive) → webp src/assets.
// Usage : node scripts/convert-trackit-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC =
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/Trackit';
const OUT = 'src/assets';
mkdirSync(OUT, { recursive: true });

// Hero cinématique (iPhone en main, paysage)
await sharp(`${SRC}/mockup Trackit.jpg`)
  .resize({ width: 2200, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(`${OUT}/trackit-hero.webp`);
console.log('✓ trackit-hero.webp');

// Écrans téléphone (portrait) pour les mockups iPhone
const phones = [
  ['à voir.jpg', 'trackit-avoir.webp'],
  ['Recherche.jpg', 'trackit-recherche.webp'],
  ['Historique.jpg', 'trackit-historique.webp'],
  ['A commencer.jpg', 'trackit-commencer.webp'],
  ['Details série.jpg', 'trackit-detail.webp'],
];
for (const [src, out] of phones) {
  await sharp(`${SRC}/${src}`)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${out}`);
  console.log('✓', out);
}

// Backdrop art (Daredevil) pour la signature interactive — bande sans texte
await sharp(`${SRC}/Details série.jpg`)
  .extract({ left: 0, top: 350, width: 1290, height: 620 })
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(`${OUT}/trackit-dd-backdrop.webp`);
console.log('✓ trackit-dd-backdrop.webp');
