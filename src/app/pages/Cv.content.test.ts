import { expect, it } from 'vitest';
import { CV_NAME, getCvContent } from './Cv.content';

it('résout le contenu FR et EN avec parité de listes', () => {
  const fr = getCvContent('fr');
  const en = getCvContent('en');
  expect(fr.experiences).toHaveLength(3);
  expect(en.experiences).toHaveLength(3);
  expect(fr.education).toHaveLength(2);
  expect(en.education).toHaveLength(2);
  expect(fr.skills).toHaveLength(5);
  expect(en.skills).toHaveLength(5);
  expect(fr.tools).toHaveLength(4);
  expect(fr.languages).toHaveLength(2);
  expect(en.languages).toHaveLength(2);
});

it('nom et libellés cohérents avec la langue', () => {
  expect(CV_NAME).toBe('Alexis Kabiche');
  expect(getCvContent('fr').name).toBe('Alexis Kabiche');
  expect(getCvContent('fr').title).toMatch(/Designer/);
  expect(getCvContent('fr').labels.experience).toBe('Expérience');
  expect(getCvContent('en').labels.experience).toBe('Experience');
});

it('chaque expérience a des champs non vides dans les deux langues', () => {
  for (const lang of ['fr', 'en'] as const) {
    for (const exp of getCvContent(lang).experiences) {
      expect(exp.role.length).toBeGreaterThan(0);
      expect(exp.company.length).toBeGreaterThan(0);
      expect(exp.period.length).toBeGreaterThan(0);
      expect(exp.bullets.length).toBeGreaterThan(0);
      for (const b of exp.bullets) expect(b.length).toBeGreaterThan(0);
      expect(exp.tags.length).toBeGreaterThan(0);
    }
  }
});

it('le poste actuel couvre produit, marque et workflows IA', () => {
  const [current] = getCvContent('fr').experiences;
  expect(current.company).toBe('SPVIE Assurances');
  expect(current.bullets.join(' ')).toMatch(/charte graphique SPVIE/);
  expect(current.bullets.join(' ')).toMatch(/Agir Pour Toutes/);
  expect(current.bullets.join(' ')).toMatch(/Claude Code/);
  expect(current.tags).toContain('Direction artistique');
});

it('ShopInCar (2020) ne figure plus dans le CV', () => {
  for (const lang of ['fr', 'en'] as const) {
    const companies = getCvContent(lang).experiences.map((e) => e.company);
    expect(companies).not.toContain('ShopInCar');
  }
});

it('contact tiré de SITE_CONTACT ; LinkedIn renseigné', () => {
  const c = getCvContent('fr').contact;
  expect(c.email).toContain('@');
  expect(c.location.length).toBeGreaterThan(0);
  expect(c.site).toBe('alexiskabiche.com');
  expect(c.linkedin).toContain('linkedin.com/in/');
});
