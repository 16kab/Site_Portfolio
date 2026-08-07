// Conversion des captures de l'app mobile CGRM → webp src/assets.
// Matching par nom normalisé (accents/espaces). Portrait mobile, on n'agrandit
// pas (les sources font ~780px de large). Usage : node scripts/convert-cgrm-assets.mjs
import sharp from 'sharp';
import { readdirSync } from 'node:fs';

const SRC =
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/CGRM';
const OUT = 'src/assets';

const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const files = readdirSync(SRC).filter((f) => /\.jpe?g$/i.test(f));

// [slug de sortie, mot-clé normalisé recherché dans le nom de fichier]
const wanted = [
  ['accueil', 'homepage'],
  ['remboursement', 'voir mes remboursements'],
  ['document', 'envoyer un document'],
  ['contrats', 'contrats'],
  ['echeances', 'echeances'],
  ['echanges', 'echanges'],
];

for (const [slug, key] of wanted) {
  const matches = files
    .filter((f) => norm(f).includes(key))
    .sort((a, b) => a.length - b.length);
  if (matches.length === 0) {
    console.warn('⚠ introuvable:', key);
    continue;
  }
  const src = matches[0];
  const out = `cgrm-${slug}.webp`;
  await sharp(`${SRC}/${src}`)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${out}`);
  console.log('✓', out, '←', src);
}
