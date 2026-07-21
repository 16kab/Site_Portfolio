/**
 * Vérifie l'artefact de pré-rendu (dist/) : chaque route doit disposer de son
 * index.html avec les métadonnées de partage attendues. C'est exactement ce
 * que Vercel sert aux robots — donc la garde la plus fidèle (vite preview,
 * lui, applique une réécriture SPA et ne sert pas les fichiers imbriqués).
 *
 * À exécuter après `npm run build`.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSeo } from './load-seo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');

const extract = (html, re) => (html.match(re) ?? [])[1];

async function main() {
  const { SITE, getAllRouteMeta } = await loadSeo();
  const routes = getAllRouteMeta();
  const errors = [];

  for (const { path: routePath, title } of routes) {
    const file =
      routePath === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, routePath.replace(/^\//, ''), 'index.html');

    let html;
    try {
      html = await readFile(file, 'utf8');
    } catch {
      errors.push(`${routePath} : fichier manquant (${file})`);
      continue;
    }

    const ogTitle = extract(html, /og:title" content="([^"]*)"/);
    const ogUrl = extract(html, /og:url" content="([^"]*)"/);
    const expectedUrl = `${SITE.baseUrl}${routePath}`;
    // Les meta sont échappées HTML dans le fichier (& → &amp;)
    const expectedTitle = title.replace(/&/g, '&amp;');

    if (ogTitle !== expectedTitle) {
      errors.push(
        `${routePath} : og:title « ${ogTitle} » ≠ attendu « ${expectedTitle} »`,
      );
    }
    if (ogUrl !== expectedUrl) {
      errors.push(
        `${routePath} : og:url « ${ogUrl} » ≠ attendu « ${expectedUrl} »`,
      );
    }
  }

  if (errors.length > 0) {
    console.error('Pré-rendu invalide :');
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }

  console.log(`Pré-rendu vérifié : ${routes.length} routes conformes.`);
}

main().catch((error) => {
  console.error('Échec de la vérification du pré-rendu :', error);
  process.exit(1);
});
