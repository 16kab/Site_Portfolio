import { test, expect } from '@playwright/test';

test.describe('Formulaire de contact', () => {
  test('soumet avec succès (EmailJS intercepté, aucun envoi réel)', async ({
    page,
  }) => {
    let emailjsCalled = false;
    await page.route('**/api.emailjs.com/**', async (route) => {
      emailjsCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'OK',
      });
    });

    await page.goto('/contact');

    await page.getByLabel(/^Nom/).fill('Kabiche');
    await page.getByLabel(/^Prénom/).fill('Alexis');
    await page.getByLabel(/^Email/).fill('test@example.com');
    await page.getByLabel(/^Objet/).fill('Sujet E2E');
    await page.getByLabel(/^Message/).fill('Bonjour, ceci est un test E2E.');

    await page.getByRole('button', { name: /Envoyer/ }).click();

    await expect(page.getByRole('dialog')).toContainText(
      'Message envoyé avec succès',
    );
    expect(emailjsCalled).toBe(true);
  });

  test('affiche les erreurs de validation sur un envoi vide', async ({
    page,
  }) => {
    let emailjsCalled = false;
    await page.route('**/api.emailjs.com/**', async (route) => {
      emailjsCalled = true;
      await route.fulfill({ status: 200, body: 'OK' });
    });

    await page.goto('/contact');
    await page.getByRole('button', { name: /Envoyer/ }).click();

    await expect(page.getByText('Ce champ est requis').first()).toBeVisible();
    expect(emailjsCalled).toBe(false);
  });
});
