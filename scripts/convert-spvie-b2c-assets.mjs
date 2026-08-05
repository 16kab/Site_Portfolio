// Conversion one-off des captures Parcours B2C (SPVIE) → webp src/assets.
// Usage : node scripts/convert-spvie-b2c-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC =
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/Parcours B2C';
const OUT = 'src/assets';
mkdirSync(OUT, { recursive: true });

// Étapes du tunnel (ordre du walkthrough). Écrans desktop paysage.
const map = [
  ['Choix assurance.jpg', 'spvie-b2c-01-type.webp'],
  ['Choix besoins.jpg', 'spvie-b2c-02-besoins.webp'],
  ['Budget.png', 'spvie-b2c-03-budget.webp'],
  ['Besoins.jpg', 'spvie-b2c-04-couverture.webp'],
  ['Loader 06.jpg', 'spvie-b2c-loader.webp'],
  ['Aucun menu sélectionné.png', 'spvie-b2c-05-offre.webp'],
  ['comparateur.jpg', 'spvie-b2c-comparateur.webp'],
  ['Coordonnées.png', 'spvie-b2c-06-coordonnees.webp'],
  ['Affichage principal.jpg', 'spvie-b2c-07-recap.webp'],
];

for (const [src, out] of map) {
  await sharp(`${SRC}/${src}`)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${out}`);
  console.log('✓', out);
}
