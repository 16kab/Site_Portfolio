import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * Vérifie le poids (gzip) du JavaScript chargé au premier rendu, hors
 * pages lazy-loadées. Le budget est délibérément proche de la mesure
 * réelle : toute dérive significative fait échouer la CI.
 *
 * Mesuré au 2026-07-17 : chunk d'entrée ≈ 179 kB gzip.
 */
const ASSETS_DIR = 'dist/assets';
const ENTRY_BUDGET_KB = 190;

function gzipKb(filePath) {
  return gzipSync(readFileSync(filePath)).length / 1024;
}

const files = readdirSync(ASSETS_DIR);
const entry = files.find((name) => /^index-.*\.js$/.test(name));

if (!entry) {
  console.error(
    `❌ Chunk d'entrée introuvable dans ${ASSETS_DIR} — le build a-t-il tourné ?`,
  );
  process.exit(1);
}

const entryKb = gzipKb(join(ASSETS_DIR, entry));
const rounded = entryKb.toFixed(1);

console.log(`Chunk d'entrée : ${entry}`);
console.log(`Poids gzip     : ${rounded} kB (budget ${ENTRY_BUDGET_KB} kB)`);

if (entryKb > ENTRY_BUDGET_KB) {
  console.error(
    `❌ Budget dépassé de ${(entryKb - ENTRY_BUDGET_KB).toFixed(1)} kB.`,
  );
  process.exit(1);
}

console.log('✅ Budget respecté.');
