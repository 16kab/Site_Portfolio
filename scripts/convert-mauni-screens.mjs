// Conversion des 7 écrans Mauni (light + dark) → webp src/assets.
// Matching par nom normalisé (sans accents ni séparateurs) + suffixe de thème.
// Usage : node scripts/convert-mauni-screens.mjs
import sharp from 'sharp';
import { readdirSync } from 'node:fs';

const SRC = 'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/mauni';
const OUT = 'src/assets';

const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const files = readdirSync(SRC).filter((f) => /\.png$/i.test(f));

// [slug de sortie, mot-clé normalisé de la source]
const wanted = [
  ['accueil', 'accueil'],
  ['budget', 'budget1'],
  ['repartition', 'budget2'],
  ['epargne', 'epargne'],
  ['previsionnel', 'previsionnel'],
  ['transaction', 'transaction'],
  ['reglages', 'reglages'],
];

for (const [slug, key] of wanted) {
  for (const theme of ['light', 'dark']) {
    const src = files.find((f) => norm(f).includes(key) && norm(f).includes(theme));
    if (!src) {
      console.warn('⚠ introuvable:', key, theme);
      continue;
    }
    const out = `mauni-${slug}-${theme}.webp`;
    await sharp(`${SRC}/${src}`)
      .resize({ width: 760, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(`${OUT}/${out}`);
    console.log('✓', out, '←', src);
  }
}
