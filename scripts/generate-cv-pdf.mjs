// Génère le CV en PDF A4 vectoriel (FR + EN) depuis la page /cv.
// Prérequis : `npm run build` d'abord (le script sert le contenu de dist/).
// Sortie : public/cv-alexis-kabiche-{fr,en}.pdf (servis en téléchargement).
//
// page.pdf() de Playwright rend en média « print » par défaut : la CSS
// @media print de Cv.css masque le chrome du site et force le blanc.

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PORT = 4317;
const BASE = `http://localhost:${PORT}`;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public');

const targets = [
  { lang: 'fr', file: 'cv-alexis-kabiche-fr.pdf' },
  { lang: 'en', file: 'cv-alexis-kabiche-en.pdf' },
];

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('Le serveur de preview ne répond pas.');
}

const preview = spawn(
  'npx',
  ['vite', 'preview', '--port', String(PORT), '--strictPort'],
  { cwd: root, stdio: 'inherit', shell: true },
);

try {
  await waitForServer(`${BASE}/`);
  const browser = await chromium.launch();
  for (const { lang, file } of targets) {
    const context = await browser.newContext();
    await context.addInitScript((l) => {
      try {
        localStorage.setItem('lang', l);
      } catch {
        /* stockage indisponible */
      }
    }, lang);
    const page = await context.newPage();
    await page.goto(`${BASE}/cv`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.cv-sheet');
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: path.join(outDir, file),
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
    await context.close();
    console.log('✅ écrit :', file);
  }
  await browser.close();
} finally {
  // Windows + shell:true : `preview.kill()` ne tue pas l'arbre (vite reste et
  // garde le port). On tue l'arbre de process, puis on force la sortie.
  if (process.platform === 'win32' && preview.pid) {
    spawn('taskkill', ['/pid', String(preview.pid), '/t', '/f'], {
      stdio: 'ignore',
      shell: true,
    });
  } else {
    preview.kill();
  }
}

process.exit(0);
