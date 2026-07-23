/**
 * Convertit les captures d'écran Mauni (PNG, 1290×2796) en WebP et les dépose
 * dans src/assets/ sous les noms attendus par MauniShowcase.tsx.
 *
 * Les noms sources sont irréguliers (« Budget 1_light » mais « Budget2_light »,
 * espaces variables) → table de correspondance explicite, pas de glob/regex.
 *
 * Usage :
 *   node scripts/convert-mauni-assets.mjs ["<dossier source>"]
 * Sans argument, utilise le dossier OneDrive par défaut ci-dessous.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC_DIR =
  process.argv[2] ||
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/mauni';
const DEST_DIR = path.resolve(__dirname, '../src/assets');

const QUALITY = 80;

// [ fichier source PNG, cible WebP dans src/assets/ ]
// NB : Budget 2 = l'écran « Répartition » (l'anneau des dépenses).
//      Epargne_dark n'est pas converti (section 05 = image unique en clair).
const MAP = [
  ['Accueil_light.png', 'mauni-app-accueil.webp'],
  ['Accueil_dark.png', 'mauni-app-accueil-dark.webp'],
  ['Transaction_light.png', 'mauni-app-transactions.webp'],
  ['Transaction_dark.png', 'mauni-app-transactions-dark.webp'],
  ['Budget 1_light.png', 'mauni-app-budget.webp'],
  ['Budget 1_dark.png', 'mauni-app-budget-dark.webp'],
  ['Budget2_light.png', 'mauni-app-repartition.webp'],
  ['Budget 2_dark.png', 'mauni-app-repartition-dark.webp'],
  ['Previsionnel_light.png', 'mauni-app-previsionnel.webp'],
  ['Previsionnel_dark.png', 'mauni-app-previsionnel-dark.webp'],
  ['Epargne_light.png', 'mauni-app-epargne.webp'],
  ['reglages_light.png', 'mauni-app-reglages.webp'],
  ['reglages_dark.png', 'mauni-app-reglages-dark.webp'],
];

const kb = (bytes) => `${Math.round(bytes / 1024)} Ko`;

let ok = 0;
for (const [src, dest] of MAP) {
  const srcPath = path.join(SRC_DIR, src);
  const destPath = path.join(DEST_DIR, dest);
  try {
    const before = statSync(srcPath).size;
    await sharp(srcPath).webp({ quality: QUALITY }).toFile(destPath);
    const after = statSync(destPath).size;
    console.log(`✓ ${src}  →  ${dest}   (${kb(before)} → ${kb(after)})`);
    ok += 1;
  } catch (err) {
    console.error(`✗ ${src}  →  ${dest}   ${err.message}`);
  }
}

console.log(`\n${ok}/${MAP.length} converties dans ${DEST_DIR}`);
if (ok !== MAP.length) process.exit(1);
