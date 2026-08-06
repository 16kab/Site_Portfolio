// Conversion des slides curées de la charte graphique SPVIE → webp src/assets.
// Matching par nom normalisé (accents/espaces) ; on garde le fichier le plus
// court pour éviter les doublons « -1 ». Usage : node scripts/convert-charte-spvie-assets.mjs
import sharp from 'sharp';
import { readdirSync } from 'node:fs';

const SRC =
  'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/Charte graphique';
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
  ['identite', 'identite visuelle'],
  ['couleurs', 'utilisation des couleurs'],
  ['typo', 'polices de caracteres'],
  ['typo-ecriture', "ecriture"],
  ['pattern', 'le pattern'],
  ['elements', 'elements graphiques'],
  ['logo', 'logo & declinaisons'],
  ['logo-explication', 'explication du logo'],
  ['zones', 'zones de protection'],
  ['marques', 'les marques'],
  ['wealth', 'wealth'],
  ['international', 'international'],
  ['epargne', 'epargne'],
  ['photos', 'style de photos'],
  ['carte-visite', 'carte de visite'],
  ['papeterie', 'papeterie'],
  ['social-linkedin', 'linkedin'],
  ['social-facebook', 'facebook'],
  ['reseaux', 'reseaux'],
  ['mockup-1', 'mockup #1'],
  ['mockup-2', 'mockup #2'],
  ['mockup-3', 'mockup #3'],
  ['mockup-4', 'mockup #4'],
  ['mockup-site', 'mockup site'],
  ['mise-en-situation', 'mise en situation'],
  ['presentation', 'presentation de la marque'],
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
  const out = `charte-${slug}.webp`;
  await sharp(`${SRC}/${src}`)
    .resize({ width: 1280 })
    .webp({ quality: 80 })
    .toFile(`${OUT}/${out}`);
  console.log('✓', out, '←', src);
}
