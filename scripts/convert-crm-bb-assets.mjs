// Conversion one-off des captures CRM BigBroker (JPG OneDrive) → webp src/assets.
// Usage : node scripts/convert-crm-bb-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC =
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/CRM BB';
const OUT = 'src/assets';
mkdirSync(OUT, { recursive: true });

const map = [
  ['Liste clients.jpg', 'crm-bb-board.webp'],
  ['détails par conseiller.jpg', 'crm-bb-conseiller.webp'],
  ['groupe.jpg', 'crm-bb-groupes.webp'],
  ['Règles de dispatch par sources.jpg', 'crm-bb-dispatch.webp'],
  ['import de leads.jpg', 'crm-bb-import.webp'],
  ['relancer devis.jpg', 'crm-bb-relance.webp'],
];

for (const [src, out] of map) {
  await sharp(`${SRC}/${src}`)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${out}`);
  console.log('✓', out);
}
