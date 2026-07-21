import { defineConfig, devices } from '@playwright/test';

/**
 * Régression visuelle — isolée de la suite E2E fonctionnelle.
 *
 * Les captures de référence sont générées dans l'image Docker Playwright
 * (Linux) et la CI compare dans CETTE MÊME image (job `visual`), afin que le
 * rendu (polices, anti-crénelage) soit identique. Ne jamais générer les
 * références sous Windows : elles ne correspondraient pas à la CI.
 *
 * Pages animées en boucle (accueil : Grainient WebGL + Shuffle) exclues :
 * elles ne se stabilisent jamais.
 */
export default defineConfig({
  testDir: './e2e-visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  expect: {
    toHaveScreenshot: {
      // Tolère les micro-différences de rendu ; casse sur un vrai changement
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: 'http://localhost:4173',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'visual',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
