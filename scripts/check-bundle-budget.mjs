import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * Vérifie le poids (gzip) du JavaScript chargé au premier rendu, hors
 * pages lazy-loadées. Le budget est délibérément proche de la mesure
 * réelle : toute dérive significative fait échouer la CI.
 *
 * Les fichiers mesurés sont ceux que dist/index.html charge réellement :
 * le script d'entrée et ses chunks préchargés (modulepreload). Depuis que
 * le build a deux pages (site + /salon/), le code partagé (GSAP) vit dans
 * un chunk commun : il faut le compter avec l'entrée.
 *
 * Mesuré au 2026-07-17 : chunk d'entrée ≈ 179 kB gzip.
 * Mesuré au 2026-11-02 : entrée + chunk partagé ≈ 178 kB gzip.
 */
const DIST_DIR = 'dist';
const ENTRY_BUDGET_KB = 190;

function gzipKb(filePath) {
  return gzipSync(readFileSync(filePath)).length / 1024;
}

let html;
try {
  html = readFileSync(join(DIST_DIR, 'index.html'), 'utf8');
} catch {
  console.error(
    `❌ ${DIST_DIR}/index.html introuvable — le build a-t-il tourné ?`,
  );
  process.exit(1);
}

const scripts = [
  ...html.matchAll(/<script[^>]+type="module"[^>]+src="\/([^"]+\.js)"/g),
  ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/([^"]+\.js)"/g),
].map((match) => match[1]);

if (scripts.length === 0) {
  console.error("❌ Aucun script d'entrée trouvé dans dist/index.html.");
  process.exit(1);
}

let totalKb = 0;
for (const file of scripts) {
  const kb = gzipKb(join(DIST_DIR, file));
  totalKb += kb;
  console.log(`Chunk initial  : ${file} (${kb.toFixed(1)} kB)`);
}
console.log(
  `Poids gzip     : ${totalKb.toFixed(1)} kB (budget ${ENTRY_BUDGET_KB} kB)`,
);

if (totalKb > ENTRY_BUDGET_KB) {
  console.error(
    `❌ Budget dépassé de ${(totalKb - ENTRY_BUDGET_KB).toFixed(1)} kB.`,
  );
  process.exit(1);
}

console.log('✅ Budget respecté.');
