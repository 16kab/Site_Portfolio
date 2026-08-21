# Refonte page « Contact » + section Références — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre `/contact` (hero Bricolage, monochrome, cohérent « À propos ») et y ajouter une section « Références » = témoignage rotatif centré, purement typographique, sans photo — en conservant intégralement la mécanique du formulaire.

**Architecture:** Un nouveau composant présentational `ContactReferences` (état d'index interne, `motion/react`, monochrome, sans image) porte le carrousel de témoignages et ses données placeholder bilingues typées. `Contact.tsx` est retravaillée : hero en Bricolage, insertion de `<ContactReferences />` entre le hero et le formulaire, et le formulaire garde sa logique existante (`useEmailForm`, honeypot, RGPD, popup).

**Tech Stack:** React 19 + Vite + TypeScript ; Tailwind v4 (config CSS) ; `motion/react` ; react-router v7 ; Vitest + @testing-library/react ; Biome ; police `--font-manifeste` (Bricolage Grotesque, déjà présente).

**Spec:** docs/superpowers/specs/2026-08-21-contact-refonte-design.md

## Global Constraints

- **motion/react** uniquement — jamais `framer-motion`.
- **Pas de shadcn** : ne pas créer `/components/ui`, ne pas utiliser `bg-background` / `text-muted-foreground` / `border-border`. Couleurs = tokens `--portfolio-*` uniquement (monochrome, theme-aware).
- **Aucune photo** dans les références : **aucune balise `<img>`** dans `ContactReferences`.
- **Intégrité placeholder** : aucun nom de personne, aucune entreprise réelle présentée comme recommandation. Attributions génériques (rôle + secteur). Les entrées placeholder n'ont **pas** de champ `name`.
- **Bilingue** FR + EN, même nombre d'entrées, `quote.fr`/`quote.en` non vides.
- **Formulaire inchangé** : `useEmailForm`, `handleSubmit`, honeypot `site_web`, messages d'erreur, `SuccessPopup`, note RGPD, `RollingText` — aucune régression.
- **A11y** : contrôles du carrousel = vrais `<button>` avec `aria-label` ; citation en conteneur `aria-live="polite"` ; point actif `aria-current="true"`. `prefers-reduced-motion` coupe les animations.
- **Budget** ≤ 190 kB gzip (chunk d'entrée). Aucune nouvelle dépendance.
- Chaque tâche finit par `npx vitest run <fichier de test>` vert, puis un commit.

---

## File Structure

- **Create** `src/app/components/ContactReferences.tsx` — carrousel de témoignages (composant + type `Reference` + données placeholder `referencesData`). Responsabilité unique : afficher/faire tourner les références, sans photo.
- **Create** `src/app/components/ContactReferences.test.tsx` — rendu 1re citation, navigation (suivant + point), absence de `<img>`, parité FR/EN, absence de `name` (garde-fou).
- **Modify** `src/app/pages/Contact.tsx` — hero Bricolage + insertion `<ContactReferences />` ; formulaire/logique conservés.
- **Create** `src/app/pages/Contact.test.tsx` — h1 présent, section références présente, 5 champs du formulaire rendus, pas de `<img>`.

---

## Task 1: Composant `ContactReferences` (+ données placeholder)

**Files:**
- Create: `src/app/components/ContactReferences.tsx`
- Test: `src/app/components/ContactReferences.test.tsx`

**Interfaces:**
- Consumes : `useLang()` depuis `../i18n` (retourne `{ lang: 'fr' | 'en' }`) ; `motion, AnimatePresence, useReducedMotion` depuis `motion/react` ; `ArrowUpRight` depuis `lucide-react`.
- Produces :
  - `interface Reference { id: number; quote: { fr: string; en: string }; name?: string; role: { fr: string; en: string }; company?: { fr: string; en: string } }`
  - `const referencesData: Reference[]` (3 entrées placeholder, sans `name`)
  - `export function ContactReferences(): JSX.Element` (default export aussi)

- [ ] **Step 1: Écrire le test qui échoue**

Créer `src/app/components/ContactReferences.test.tsx` :

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ContactReferences, referencesData } from './ContactReferences';

it('affiche la première citation au montage', () => {
  render(<ContactReferences />);
  expect(screen.getByText(referencesData[0].quote.fr)).toBeTruthy();
});

// Navigation testée via `aria-current` des points (rendu synchrone, hors
// AnimatePresence — évite les faux négatifs liés au timing d'exit en jsdom).
it('le bouton « suivant » avance le témoignage actif', () => {
  render(<ContactReferences />);
  const dots = () =>
    within(screen.getByTestId('references-dots')).getAllByRole('button');
  expect(dots()[0].getAttribute('aria-current')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));
  expect(dots()[1].getAttribute('aria-current')).toBe('true');
});

it('cliquer un point active le témoignage correspondant', () => {
  render(<ContactReferences />);
  const dots = () =>
    within(screen.getByTestId('references-dots')).getAllByRole('button');
  fireEvent.click(dots()[2]);
  expect(dots()[2].getAttribute('aria-current')).toBe('true');
});

it('ne contient aucune image (pas de photo)', () => {
  const { container } = render(<ContactReferences />);
  expect(container.querySelector('img')).toBeNull();
});

it('données placeholder : parité FR/EN, non vides, sans identité réelle', () => {
  expect(referencesData.length).toBeGreaterThanOrEqual(3);
  for (const ref of referencesData) {
    expect(ref.quote.fr.length).toBeGreaterThan(0);
    expect(ref.quote.en.length).toBeGreaterThan(0);
    expect(ref.role.fr.length).toBeGreaterThan(0);
    expect(ref.role.en.length).toBeGreaterThan(0);
    // Garde-fou anti fausse identité : pas de nom de personne en placeholder.
    expect(ref.name).toBeUndefined();
  }
});
```

- [ ] **Step 2: Lancer le test — il échoue**

Run: `npx vitest run src/app/components/ContactReferences.test.tsx`
Expected: FAIL (module `./ContactReferences` introuvable).

- [ ] **Step 3: Écrire le composant**

Créer `src/app/components/ContactReferences.tsx`. Note : `useLang()` a un fallback FR, donc utilisable hors provider (tests). Les citations placeholder sont **génériques** (rôle + secteur, aucun nom, aucune entreprise réelle).

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useLang } from '../i18n';

export interface Reference {
  id: number;
  quote: { fr: string; en: string };
  name?: string; // absent en placeholder (anti fausse identité)
  role: { fr: string; en: string };
  company?: { fr: string; en: string };
}

// Placeholder NEUTRE : attributions génériques (rôle + secteur), aucune
// personne réelle, aucune entreprise réelle. À remplacer par de vraies
// références (ajouter `name`, vrais `company`) quand elles seront fournies.
export const referencesData: Reference[] = [
  {
    id: 1,
    quote: {
      fr: 'Il transforme un besoin flou en interface claire — et il livre, sans qu’on ait à repasser derrière.',
      en: 'He turns a fuzzy need into a clear interface — and ships it, without anyone having to redo the work.',
    },
    role: { fr: 'Direction Produit', en: 'Head of Product' },
    company: { fr: 'SaaS B2B', en: 'B2B SaaS' },
  },
  {
    id: 2,
    quote: {
      fr: 'Une identité pensée de bout en bout, cohérente sur chaque support. On s’est senti compris.',
      en: 'An identity thought through end to end, consistent on every medium. We felt understood.',
    },
    role: { fr: 'Fondatrice', en: 'Founder' },
    company: { fr: 'Association', en: 'Non-profit' },
  },
  {
    id: 3,
    quote: {
      fr: 'Rigueur produit et sens du détail visuel dans la même personne — rare et précieux.',
      en: 'Product rigor and an eye for visual detail in the same person — rare and valuable.',
    },
    role: { fr: 'Lead Design', en: 'Design Lead' },
    company: { fr: 'Studio', en: 'Studio' },
  },
];

const LABEL_STYLE = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 500,
  fontSize: '13px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--portfolio-text-muted)',
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function ContactReferences() {
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const active = referencesData[index];
  const count = referencesData.length;

  const next = () => setIndex((i) => (i + 1) % count);
  const trans = (d: number) =>
    reduced ? { duration: 0 } : { duration: d, ease: EASE };
  const pad2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="mx-auto w-full max-w-3xl px-2 text-center">
      {/* Contexte (rôle · secteur) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`ctx-${active.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={trans(0.3)}
          className="mb-8 inline-flex items-center gap-3"
          style={LABEL_STYLE}
        >
          <span
            aria-hidden="true"
            style={{
              width: '32px',
              height: '1px',
              backgroundColor: 'var(--portfolio-card-border)',
            }}
          />
          {active.company ? active.company[lang] : ''}
        </motion.div>
      </AnimatePresence>

      {/* Citation (aria-live pour annoncer le changement) */}
      <div aria-live="polite" className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={`quote-${active.id}`}
            initial={reduced ? false : { opacity: 0, y: 30, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -30, filter: 'blur(6px)' }}
            transition={trans(0.5)}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(1.5rem, 1rem + 2.2vw, 2.5rem)',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: 'var(--portfolio-text-primary)',
            }}
          >
            {active.quote[lang]}
          </motion.blockquote>
        </AnimatePresence>
      </div>

      {/* Auteur : (nom ·) rôle · secteur */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`author-${active.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={trans(0.3)}
          className="mt-10 flex items-center justify-center gap-3"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            color: 'var(--portfolio-text-secondary)',
          }}
        >
          <span style={{ color: 'var(--portfolio-text-muted)' }}>
            {pad2(index + 1)} / {pad2(count)}
          </span>
          <span
            aria-hidden="true"
            style={{
              width: '24px',
              height: '1px',
              backgroundColor: 'var(--portfolio-card-border)',
            }}
          />
          <span>
            {active.name ? `${active.name} · ` : ''}
            {active.role[lang]}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Navigation : points + suivant */}
      <div className="mt-10 flex items-center justify-center gap-6">
        <div className="flex items-center gap-3" data-testid="references-dots">
          {referencesData.map((ref, i) => (
            <button
              key={ref.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={
                lang === 'fr'
                  ? `Aller au témoignage ${i + 1}`
                  : `Go to testimonial ${i + 1}`
              }
              aria-current={i === index ? 'true' : undefined}
              className="p-1 cursor-pointer"
              style={{ background: 'transparent', border: 'none' }}
            >
              <span
                className="block rounded-full"
                style={{
                  width: '8px',
                  height: '8px',
                  transition: 'all 0.3s',
                  backgroundColor:
                    i === index
                      ? 'var(--portfolio-text-primary)'
                      : 'var(--portfolio-card-border)',
                  transform: i === index ? 'scale(1)' : 'scale(0.75)',
                }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center gap-1 cursor-pointer"
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '13px',
            letterSpacing: '0.04em',
            color: 'var(--portfolio-text-secondary)',
          }}
        >
          {lang === 'fr' ? 'Suivant' : 'Next'}
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default ContactReferences;
```

- [ ] **Step 4: Lancer le test — il passe**

Run: `npx vitest run src/app/components/ContactReferences.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Vérifs locales**

Run: `npx tsc --noEmit` → clean.
Run: `npx biome check --write src/app/components/ContactReferences.tsx src/app/components/ContactReferences.test.tsx` puis `npx biome check` sur ces fichiers → pas de nouvelle erreur.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/ContactReferences.tsx src/app/components/ContactReferences.test.tsx
git commit -m "feat(contact): composant Références (témoignage rotatif, sans photo, placeholder neutre)"
```

---

## Task 2: Refonte de `Contact.tsx` (hero Bricolage + insertion Références)

**Files:**
- Modify: `src/app/pages/Contact.tsx`
- Test: `src/app/pages/Contact.test.tsx`

**Interfaces:**
- Consumes (Task 1) : `import { ContactReferences } from '../components/ContactReferences';`
- Produces : composant `Contact` (default export) inchangé en signature.

- [ ] **Step 1: Écrire le test de page (qui échoue)**

Créer `src/app/pages/Contact.test.tsx`. `useT`/`useEmailForm` fonctionnent hors provider (fallback FR) ; on enveloppe dans `MemoryRouter` (la page utilise `<Link>`).

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import Contact from './Contact';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/contact']}>
      <Contact />
    </MemoryRouter>,
  );

it('affiche le titre hero « Travaillons ensemble » en h1', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
    /Travaillons ensemble/,
  );
});

it('rend la section Références (bouton suivant présent)', () => {
  renderPage();
  expect(screen.getByRole('button', { name: /suivant|next/i })).toBeTruthy();
});

it('conserve les 5 champs du formulaire', () => {
  renderPage();
  const form = document.querySelector('form') as HTMLFormElement;
  for (const name of ['nom', 'prenom', 'email', 'objet', 'message']) {
    expect(form.elements.namedItem(name)).toBeTruthy();
  }
});

it('la section Références ne contient pas d’image', () => {
  const { container } = renderPage();
  expect(container.querySelector('img')).toBeNull();
});
```

- [ ] **Step 2: Lancer le test — il échoue**

Run: `npx vitest run src/app/pages/Contact.test.tsx`
Expected: FAIL (pas encore de bouton « suivant » / section références ; le h1 existe déjà donc ce test-là passe, les autres échouent).

- [ ] **Step 3: Modifier le hero (titre en Bricolage)**

Dans `src/app/pages/Contact.tsx`, le `<h1>` du header utilise actuellement `fontFamily: 'Manrope, sans-serif'`, `fontWeight: 700`, `fontSize: 'clamp(2rem, 1rem + 5vw, 3rem)'`, `letterSpacing: '-1.4px'`. Remplacer **son bloc `style`** par un traitement « manifeste » cohérent avec À propos :

```tsx
                style={{
                  fontFamily: 'var(--font-manifeste)',
                  fontWeight: 800,
                  fontSize: 'clamp(2.5rem, 1rem + 7vw, 5rem)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                  textWrap: 'balance',
                  color: 'var(--portfolio-text-primary)',
                } as React.CSSProperties}
```

(Le `as React.CSSProperties` couvre `textWrap` si les types React ne l'exposent pas — même pattern que la page À propos.)

- [ ] **Step 4: Importer et insérer `ContactReferences`**

En haut du fichier, ajouter l'import :

```tsx
import { ContactReferences } from '../components/ContactReferences';
```

Puis insérer la section **entre le header et la grille infos/formulaire**. Le header se termine par `</div>` (fermeture de `<div className="mb-16 md:mb-20 lg:mb-24">`). Juste après ce `</div>` et **avant** `<div className="grid grid-cols-1 lg:grid-cols-2 …">`, insérer :

```tsx
          {/* Références (témoignages) */}
          <div className="mb-16 md:mb-24 lg:mb-28">
            <ScrollRevealTitle delay={0.1}>
              <p
                className="mb-10 text-center"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: '13px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--portfolio-text-muted)',
                }}
              >
                {t.references}
              </p>
            </ScrollRevealTitle>
            <ScrollFadeIn delay={0.15}>
              <ContactReferences />
            </ScrollFadeIn>
          </div>
```

- [ ] **Step 5: Ajouter la chaîne `references` dans `STRINGS` (FR + EN)**

Dans l'objet `STRINGS`, ajouter à la section `fr` la clé `references: '(références)',` et à la section `en` `references: '(references)',`. (Placer la clé à côté de `eyebrow` dans chaque langue.)

- [ ] **Step 6: Lancer le test de page — il passe**

Run: `npx vitest run src/app/pages/Contact.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 7: Vérifier les gates globaux**

Run: `npx tsc --noEmit` → clean.
Run: `npx biome check --write src/app/pages/Contact.tsx src/app/pages/Contact.test.tsx` puis `npx biome check` sur ces fichiers → pas de nouvelle erreur.
Run: `npx vitest run` → toute la suite verte.
Run: `npm run build` → OK.
Run: `npm run budget` → ✅ ≤ 190 kB gzip.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(contact): refonte hero Bricolage + section Références intégrée"
```

---

## Self-Review

**1. Couverture spec :**
- Refonte hero Bricolage (cohérent À propos) → Task 2 step 3 ✅
- Section Références centrée typographique, sans photo → Task 1 (composant, test « pas d'img ») ✅
- Placement entre hero et formulaire → Task 2 step 4 ✅
- Rotation manuelle (points + suivant), vrais `<button>`, `aria-live`, `aria-current` → Task 1 ✅
- Monochrome tokens, motion/react, reduced-motion → Task 1 ✅
- Placeholder neutre sans fausse identité (pas de `name`) → Task 1 data + test garde-fou ✅
- Bilingue FR/EN parité → Task 1 data + test ✅
- Formulaire inchangé (5 champs, honeypot, RGPD, popup) → Task 2 ne touche pas la logique ; test « 5 champs » ✅
- Budget / gates → Task 2 step 7 ✅

**2. Placeholders :** aucun « TBD/à compléter » ; le placeholder de contenu est du vrai texte livré (générique et honnête), pas un trou.

**3. Cohérence des types :** `Reference` (Task 1) avec `quote/role/company` en `{fr,en}` et `name?` optionnel ; `ContactReferences` et `referencesData` importés tels quels en Task 2 (page) et dans les tests. `useLang().lang` indexe `quote[lang]`/`role[lang]`/`company[lang]`. `t.references` ajouté dans `STRINGS` (Task 2 step 5) et utilisé step 4.
