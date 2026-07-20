import { test, expect } from '@playwright/test';

// Restauration de la position de scroll de la liste des projets au retour.
// Mouvement réduit forcé : navigation instantanée, sans overlay ni timers de
// morph, pour un test déterministe (la logique de restauration est aussi
// couverte, sans dépendance au timing, par projetsScroll.test.ts).
test.describe('Transition projets — restauration du scroll', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  const heading = (page: import('@playwright/test').Page) =>
    page.getByRole('heading', { name: 'Projets', level: 1 });

  const bodyScrollTop = (page: import('@playwright/test').Page) =>
    page.evaluate(() => document.body.scrollTop);

  test('retour direct : liste → projet → liste', async ({ page }) => {
    await page.goto('/projets');
    await expect(heading(page)).toBeVisible();

    const carte = page.getByRole('link', { name: /Voir le projet/ }).nth(5);
    await carte.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const avant = await bodyScrollTop(page);
    expect(avant).toBeGreaterThan(1000);

    await carte.click();
    await expect(page).toHaveURL(/\/projets\/.+/);

    await page.goBack();
    await expect(page).toHaveURL(/\/projets$/);
    await expect(heading(page)).toBeVisible();
    await page.waitForTimeout(150);

    const apres = await bodyScrollTop(page);
    expect(apres).toBeGreaterThan(avant - 400);
    expect(apres).toBeGreaterThan(1000);
  });

  // Retour à la liste via le lien d'en-tête « Projets » (visible en desktop).
  test('enchaînement : liste → projet → autre projet → liste', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Lien d’en-tête en desktop');

    await page.goto('/projets');
    await expect(heading(page)).toBeVisible();

    const carte = page.getByRole('link', { name: /Voir le projet/ }).nth(5);
    await carte.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const avant = await bodyScrollTop(page);
    expect(avant).toBeGreaterThan(1000);

    await carte.click();
    await expect(page).toHaveURL(/\/projets\/.+/);
    const detail1 = page.url();

    // Sur le détail : ouvre un autre projet (URL détail différente)
    await page
      .getByRole('link', { name: /Voir le projet/ })
      .first()
      .click();
    await expect(page).not.toHaveURL(detail1);
    await expect(page).toHaveURL(/\/projets\/.+/);

    // Revient à la liste via l'en-tête
    await page.getByRole('link', { name: 'Projets' }).click();
    await expect(page).toHaveURL(/\/projets$/);
    await expect(heading(page)).toBeVisible();
    await page.waitForTimeout(150);

    const apres = await bodyScrollTop(page);
    // La liste doit être restaurée près de sa position, pas remise en haut
    expect(apres).toBeGreaterThan(avant - 400);
    expect(apres).toBeGreaterThan(1000);
  });
});

// En plein mouvement : l'overlay « morph » ne doit se dissiper qu'une fois
// la page détail réellement montée (les pages sont lazy-loadées — sans la
// poignée de main hasArrived, l'overlay révélait l'ancienne page).
test('plein mouvement : la page détail est prête quand l’overlay disparaît', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop');
  test.setTimeout(60_000); // scénario animé complet, tolérant à la charge CI
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.goto('/projets');
  await expect(
    page.getByRole('heading', { name: 'Projets', level: 1 }),
  ).toBeVisible();

  const carte = page.getByRole('link', { name: /Voir le projet/ }).nth(2);
  await carte.scrollIntoViewIfNeeded();
  await carte.click();

  // L'overlay apparaît puis se dissipe
  const overlay = page.locator('img[alt=""]').first();
  await overlay.waitFor({ state: 'attached', timeout: 3000 });
  await overlay.waitFor({ state: 'detached', timeout: 6000 });

  // À l'instant où il disparaît, la page détail est déjà là
  expect(page.url()).toMatch(/\/projets\/.+/);
  await expect(page.locator('h1')).toBeVisible({ timeout: 500 });
});

// Régression : après un retour à la liste, rouvrir un projet doit rejouer
// l'ALLER (l'image grossit depuis la carte). Un bug relançait l'animation de
// retour à la place : image plein écran se repliant sur la carte.
test('plein mouvement : rouvrir un projet après un retour repart de la carte', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop');
  test.setTimeout(60_000); // scénario animé complet, tolérant à la charge CI
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.goto('/projets');
  await expect(
    page.getByRole('heading', { name: 'Projets', level: 1 }),
  ).toBeVisible();

  const overlay = page.locator('img[alt=""]').first();

  // Aller-retour complet : liste → projet → retour (le reverse se joue)
  await page
    .getByRole('link', { name: /Voir le projet/ })
    .nth(2)
    .click();
  await overlay.waitFor({ state: 'attached', timeout: 3000 });
  await overlay.waitFor({ state: 'detached', timeout: 6000 });
  await page.goBack();
  await expect(page).toHaveURL(/\/projets$/);
  // Attend que le reverse démarre PUIS se termine (un simple « detached »
  // passerait avant même son démarrage, l'élément étant encore absent)
  await overlay.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
  await overlay.waitFor({ state: 'detached', timeout: 6000 });

  // Nouveau clic : l'overlay doit démarrer proche de la carte, pas plein
  // écran. Observation + clic atomiques, DANS la page (MutationObserver +
  // rAF + click natif) : insensible à la latence du runner de test.
  const firstWidth = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const links = document.querySelectorAll<HTMLElement>(
          'a[aria-label^="Voir le projet"]',
        );
        const link = links[1];
        if (!link) {
          resolve(-2);
          return;
        }
        // Garde-fou : -1 si aucun overlay n'apparaît (échec d'assertion
        // explicite plutôt que timeout global du test)
        const bail = setTimeout(() => resolve(-1), 5000);
        const observer = new MutationObserver(() => {
          const img = document.querySelector('img[alt=""]');
          if (!img) return;
          observer.disconnect();
          clearTimeout(bail);
          requestAnimationFrame(() => {
            resolve(img.getBoundingClientRect().width);
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        link.scrollIntoView({ block: 'center' });
        link.click();
      }),
  );
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (viewport) {
    // En début d'aller, l'image est bien plus étroite que l'écran ; le bug
    // (reverse rejoué) la faisait démarrer à la largeur du viewport.
    // (-1 = aucun overlay apparu : la transition ne s'est pas déclenchée.)
    expect(firstWidth as number).toBeGreaterThan(0);
    expect(firstWidth as number).toBeLessThan(viewport.width * 0.8);
  }

  // Et la transition aboutit sur la page détail
  await overlay.waitFor({ state: 'detached', timeout: 6000 });
  expect(page.url()).toMatch(/\/projets\/.+/);
});
