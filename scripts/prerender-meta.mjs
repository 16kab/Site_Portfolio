/**
 * Pré-rendu des métadonnées de partage social.
 *
 * Le site est une SPA : PageMeta met à jour titre / description / Open Graph
 * côté client. Or les robots de partage (LinkedIn, WhatsApp, Slack, Discord…)
 * n'exécutent pas le JavaScript et ne voient que le HTML initial — donc les
 * meta génériques de la home pour TOUTES les URL.
 *
 * Ce script, exécuté après `vite build`, génère un `index.html` par route
 * (dist/projets/agpt/index.html, etc.) avec les bonnes balises. Vercel sert
 * ces fichiers statiques en priorité sur la réécriture SPA ; le JS reprend
 * ensuite la main normalement.
 *
 * Les métadonnées proviennent de src/app/config/seo.ts (source unique,
 * partagée avec le client), chargée ici via esbuild en neutralisant les
 * imports d'assets figma:asset (inutiles pour les meta).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSeo } from './load-seo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');

const escapeAttr = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escapeText = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Applique les meta d'une route au template HTML. */
function applyMeta(template, { title, description, url }) {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const replacements = [
    [/<title>[\s\S]*?<\/title>/, `<title>${escapeText(title)}</title>`],
    [/(<meta name="description" content=")[\s\S]*?(")/, `$1${d}$2`],
    [/(<link rel="canonical" href=")[\s\S]*?(")/, `$1${escapeAttr(url)}$2`],
    [/(<meta property="og:title" content=")[\s\S]*?(")/, `$1${t}$2`],
    [/(<meta property="og:description" content=")[\s\S]*?(")/, `$1${d}$2`],
    [
      /(<meta property="og:url" content=")[\s\S]*?(")/,
      `$1${escapeAttr(url)}$2`,
    ],
    [/(<meta name="twitter:title" content=")[\s\S]*?(")/, `$1${t}$2`],
    [/(<meta name="twitter:description" content=")[\s\S]*?(")/, `$1${d}$2`],
  ];
  let html = template;
  for (const [pattern, value] of replacements) {
    if (!pattern.test(html)) {
      throw new Error(`Motif meta introuvable dans le template : ${pattern}`);
    }
    html = html.replace(pattern, value);
  }
  return html;
}

async function main() {
  const { SITE, getAllRouteMeta } = await loadSeo();
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
  const routes = getAllRouteMeta();

  let count = 0;
  for (const { path: routePath, title, description } of routes) {
    const url = `${SITE.baseUrl}${routePath === '/' ? '/' : routePath}`;
    const html = applyMeta(template, { title, description, url });

    const outFile =
      routePath === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, routePath.replace(/^\//, ''), 'index.html');

    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, html, 'utf8');
    count += 1;
  }

  console.log(`Pré-rendu : ${count} routes générées avec meta de partage.`);
}

main().catch((error) => {
  console.error('Échec du pré-rendu des meta :', error);
  process.exit(1);
});
