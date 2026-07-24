// Conversion one-off des écrans Onboarding RH (PNG OneDrive) → webp src/assets.
// Usage : node scripts/convert-onboarding-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC =
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/Onboarding RH';
const OUT = 'src/assets';
mkdirSync(OUT, { recursive: true });

const map = [
  ['arrivant/accueil.png', 'onb-arrivant-accueil.webp'],
  ['arrivant/parcours.png', 'onb-arrivant-parcours.webp'],
  ['arrivant/détail étape.png', 'onb-arrivant-detail-etape.webp'],
  ['arrivant/success.png', 'onb-arrivant-success.webp'],
  ['arrivant/Equipe.png', 'onb-arrivant-equipe.webp'],
  ['Admin/accueil.png', 'onb-rh-tableau-de-bord.webp'],
  ['Admin/Bienvenue.png', 'onb-rh-modeles.webp'],
  ['Admin/parcours.png', 'onb-rh-parcours.webp'],
  ['Admin/détail étape.png', 'onb-rh-detail-etape.webp'],
  ['Admin/Equipe.png', 'onb-rh-equipe.webp'],
];

for (const [src, out] of map) {
  await sharp(`${SRC}/${src}`)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${out}`);
  console.log('✓', out);
}
