# Transition de page « voile sombre » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une transition de page (voile sombre plein écran à bords doux) à tous les changements de route, sans casser le morph image projet.

**Architecture:** Un contrôleur `RouteTransition` garde une `displayedLocation` distincte de la location du routeur et rend `<Routes location={displayedLocation}>`. Au changement de route : voile IN (couvre) → swap `displayedLocation` + reset scroll → voile OUT (révèle). Le voile est supprimé (swap immédiat) si un morph projet est actif ou en `prefers-reduced-motion`. Le voile (`PageVeil`) est une bande sombre ~200vh à dégradé haut/bas.

**Tech Stack:** React 19 · react-router v7 (`react-router`) · `motion/react` · Vitest + @testing-library/react · Tailwind v4 · Biome.

**Spec:** `docs/superpowers/specs/2026-08-20-transition-page-voile-design.md`

## Global Constraints
- Import motion depuis **`motion/react`**. Aucune nouvelle dépendance.
- Le scroll de la page est sur **`document.body`** (`document.body.scrollTop`), pas `window`.
- **Voile supprimé** quand `usePageTransition().isTransitioning` est vrai (morph projet actif) OU `prefersReducedProjectMotion()` est vrai → swap immédiat.
- Reset scroll au **swap**, **sauf** si la page affichée est exactement `'/projets'` (elle restaure son propre scroll).
- Comparer les locations par **`location.key`** (unique par navigation).
- Budget ≤ 190 kB gzip ; tsc/Biome/tests/build verts.

---

## File Structure
- **Create** `src/app/components/PageVeil.tsx` — le voile (présentational : phase + callbacks).
- **Create** `src/app/components/PageVeil.test.tsx`
- **Create** `src/app/components/RouteTransition.tsx` — le contrôleur (displayedLocation + orchestration).
- **Create** `src/app/components/RouteTransition.test.tsx`
- **Modify** `src/app/App.tsx` — `AppContent` délègue les routes à `RouteTransition`.
- **Modify** `src/app/components/ScrollToTop.tsx` — retirer le reset de scroll (repris par le contrôleur) ; garder le nettoyage de transition.
- **Modify** `src/app/components/ScrollToTop.test.tsx` — adapter.

---

## Task 1 : `PageVeil` (le voile)

**Files:**
- Create: `src/app/components/PageVeil.tsx`
- Test: `src/app/components/PageVeil.test.tsx`

**Interfaces:**
- Produces:
  - `export type VeilPhase = 'covering' | 'revealing'`
  - `export interface PageVeilProps { phase: VeilPhase; onCovered: () => void; onRevealed: () => void }`
  - `export function PageVeil(props): JSX.Element` — bande sombre fixe qui balaie vers le haut ; appelle `onCovered` à la fin de la phase `covering`, `onRevealed` à la fin de `revealing`.

- [ ] **Step 1 : test qui échoue** — `PageVeil.test.tsx` :
```tsx
import { render, screen } from '@testing-library/react';
import { PageVeil } from './PageVeil';

it('rend un voile décoratif plein écran avec dégradé haut/bas', () => {
  const { container } = render(
    <PageVeil phase="covering" onCovered={() => {}} onRevealed={() => {}} />,
  );
  const veil = container.firstChild as HTMLElement;
  expect(veil).toBeTruthy();
  expect(veil.getAttribute('aria-hidden')).toBe('true');
  // dégradé vertical vers transparent aux bords
  expect(veil.style.background).toMatch(/gradient/);
  expect(veil.style.background).toMatch(/transparent/);
  expect(veil.style.height).toMatch(/vh/);
});
```
- [ ] **Step 2 : lancer, voir échouer** — `npx vitest run src/app/components/PageVeil.test.tsx` → FAIL (module absent).
- [ ] **Step 3 : implémenter** — `PageVeil.tsx` :
```tsx
import { motion } from 'motion/react';

export type VeilPhase = 'covering' | 'revealing';

export interface PageVeilProps {
  phase: VeilPhase;
  onCovered: () => void;
  onRevealed: () => void;
}

const DURATION = 0.45;
const EASE = [0.16, 1, 0.3, 1] as const;
// translateY (vh) : caché sous le viewport → cœur opaque centré → sorti par le haut.
const Y_BELOW = '110vh';
const Y_COVER = '-50vh';
const Y_ABOVE = '-210vh';

export function PageVeil({ phase, onCovered, onRevealed }: PageVeilProps) {
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[120]"
      style={{
        height: '200vh',
        // Bande sombre à bords haut/bas fondus (opacité 0) pour un balayage doux.
        background:
          'linear-gradient(to bottom, transparent 0%, #0a0a0a 20%, #0a0a0a 80%, transparent 100%)',
      }}
      initial={{ y: Y_BELOW }}
      animate={{ y: phase === 'covering' ? Y_COVER : Y_ABOVE }}
      transition={{ duration: DURATION, ease: EASE }}
      onAnimationComplete={() => {
        if (phase === 'covering') onCovered();
        else onRevealed();
      }}
    />
  );
}
```
- [ ] **Step 4 : lancer, voir passer** — `npx vitest run src/app/components/PageVeil.test.tsx` → PASS. Puis `npx tsc --noEmit` clean, `npx biome lint src/app/components/PageVeil.tsx` clean.
- [ ] **Step 5 : commit** — `git add -A && git commit -m "feat(transition): composant PageVeil (voile sombre à bords doux)"`

---

## Task 2 : `RouteTransition` (contrôleur)

**Files:**
- Create: `src/app/components/RouteTransition.tsx`
- Test: `src/app/components/RouteTransition.test.tsx`

**Interfaces:**
- Consumes : `PageVeil` (Task 1) ; `usePageTransition().isTransitioning` ; `prefersReducedProjectMotion()` de `../utils/projectTransition`.
- Produces : `export function RouteTransition({ children }: { children: React.ReactNode }): JSX.Element` — rend `<Routes location={displayedLocation}>{children}</Routes>` + le voile ; à passer les `<Route>` en enfants.

- [ ] **Step 1 : test qui échoue** — `RouteTransition.test.tsx` :
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, useNavigate } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { RouteTransition } from './RouteTransition';

let isTransitioning = false;
vi.mock('../context/PageTransitionContext', () => ({
  usePageTransition: () => ({ isTransitioning }),
}));

let reduced = false;
vi.mock('../utils/projectTransition', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/projectTransition')>();
  return { ...actual, prefersReducedProjectMotion: () => reduced };
});

// PageVeil mocké : expose des boutons pour simuler la fin des phases.
vi.mock('./PageVeil', () => ({
  PageVeil: ({ phase, onCovered, onRevealed }: any) => (
    <div data-testid="veil" data-phase={phase}>
      <button type="button" onClick={onCovered}>fire-covered</button>
      <button type="button" onClick={onRevealed}>fire-revealed</button>
    </div>
  ),
}));

function Nav() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/projets')}>go</button>
  );
}

const renderApp = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <RouteTransition>
        <Route path="/" element={<div>HOME<Nav /></div>} />
        <Route path="/projets" element={<div>PROJETS</div>} />
      </RouteTransition>
    </MemoryRouter>,
  );

beforeEach(() => {
  isTransitioning = false;
  reduced = false;
  document.body.scrollTop = 0;
});

it('au montage, affiche la page courante sans voile', () => {
  renderApp();
  expect(screen.getByText('HOME')).toBeTruthy();
  expect(screen.queryByTestId('veil')).toBeNull();
});

it('navigation normale : voile joué, la nouvelle page n’apparaît qu’après couverture', () => {
  renderApp();
  fireEvent.click(screen.getByText('go'));
  // voile en cours, page encore = HOME (pas de flash)
  expect(screen.getByTestId('veil').getAttribute('data-phase')).toBe('covering');
  expect(screen.getByText('HOME')).toBeTruthy();
  expect(screen.queryByText('PROJETS')).toBeNull();
  // couverture terminée → swap
  fireEvent.click(screen.getByText('fire-covered'));
  expect(screen.getByText('PROJETS')).toBeTruthy();
  expect(screen.getByTestId('veil').getAttribute('data-phase')).toBe('revealing');
  // révélation terminée → voile retiré
  fireEvent.click(screen.getByText('fire-revealed'));
  expect(screen.queryByTestId('veil')).toBeNull();
});

it('morph projet actif : swap immédiat, pas de voile', () => {
  isTransitioning = true;
  renderApp();
  fireEvent.click(screen.getByText('go'));
  expect(screen.getByText('PROJETS')).toBeTruthy();
  expect(screen.queryByTestId('veil')).toBeNull();
});

it('prefers-reduced-motion : swap immédiat, pas de voile', () => {
  reduced = true;
  renderApp();
  fireEvent.click(screen.getByText('go'));
  expect(screen.getByText('PROJETS')).toBeTruthy();
  expect(screen.queryByTestId('veil')).toBeNull();
});

it('reset le scroll au swap (sauf /projets)', () => {
  reduced = true; // swap immédiat pour simplifier
  renderApp();
  document.body.scrollTop = 500;
  fireEvent.click(screen.getByText('go')); // → /projets : PAS de reset
  expect(document.body.scrollTop).toBe(500);
});
```
- [ ] **Step 2 : lancer, voir échouer** — `npx vitest run src/app/components/RouteTransition.test.tsx` → FAIL (module absent).
- [ ] **Step 3 : implémenter** — `RouteTransition.tsx` :
```tsx
import { useEffect, useRef, useState } from 'react';
import { Routes, useLocation, type Location } from 'react-router';
import { PageVeil, type VeilPhase } from './PageVeil';
import { usePageTransition } from '../context/PageTransitionContext';
import { prefersReducedProjectMotion } from '../utils/projectTransition';

// Reset scroll au swap, sauf sur /projets (qui restaure son propre scroll).
function resetScrollFor(pathname: string) {
  if (pathname !== '/projets') document.body.scrollTop = 0;
}

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isTransitioning } = usePageTransition();
  const [displayed, setDisplayed] = useState<Location>(location);
  const [phase, setPhase] = useState<VeilPhase | null>(null);
  // Location vers laquelle on transitionne (pour un swap correct même si la
  // location change encore pendant la couverture).
  const pendingRef = useRef<Location | null>(null);

  useEffect(() => {
    if (location.key === displayed.key) return; // déjà affichée
    pendingRef.current = location;
    if (isTransitioning || prefersReducedProjectMotion()) {
      // Pas de voile : le morph/overlay gère (ou reduced-motion) → swap direct.
      setDisplayed(location);
      resetScrollFor(location.pathname);
      setPhase(null);
      return;
    }
    setPhase('covering'); // on garde `displayed` (ancienne page) jusqu'à couverture
  }, [location, displayed, isTransitioning]);

  return (
    <>
      <Routes location={displayed}>{children}</Routes>
      {phase ? (
        <PageVeil
          phase={phase}
          onCovered={() => {
            const target = pendingRef.current;
            if (target) {
              setDisplayed(target);
              resetScrollFor(target.pathname);
            }
            setPhase('revealing');
          }}
          onRevealed={() => setPhase(null)}
        />
      ) : null}
    </>
  );
}
```
- [ ] **Step 4 : lancer, voir passer** — `npx vitest run src/app/components/RouteTransition.test.tsx` → PASS (5 tests). Puis `npx tsc --noEmit` clean, `npx biome lint src/app/components/RouteTransition.tsx` clean.
- [ ] **Step 5 : commit** — `git add -A && git commit -m "feat(transition): contrôleur RouteTransition (swap masqué par le voile)"`

---

## Task 3 : Intégration `App.tsx` + `ScrollToTop`

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/components/ScrollToTop.tsx`
- Test: `src/app/components/ScrollToTop.test.tsx`

**Interfaces:**
- Consumes : `RouteTransition` (Task 2).

- [ ] **Step 1 : adapter le test ScrollToTop (échoue d'abord)** — dans `ScrollToTop.test.tsx`, **retirer** les assertions qui vérifient que `ScrollToTop` remet `document.body.scrollTop = 0` (ce reset migre vers `RouteTransition`). **Conserver** les tests du nettoyage de transition (`clearTransition` quand on quitte une route de transition) et de `shouldRestoreProjectScroll`/`isTransitionRoute`. Ajouter :
```tsx
it('ne remet plus le scroll à zéro lui-même (délégué à RouteTransition)', () => {
  // rendu sur une route quelconque avec scrollTop != 0 ; ScrollToTop ne doit pas le remettre à 0.
  document.body.scrollTop = 300;
  // (rendre ScrollToTop dans un MemoryRouter comme les autres tests du fichier)
  // ... voir helper existant du fichier ...
  expect(document.body.scrollTop).toBe(300);
});
```
  (Utiliser le même harnais de rendu que les tests existants du fichier.)
- [ ] **Step 2 : lancer, voir échouer** — `npx vitest run src/app/components/ScrollToTop.test.tsx` → FAIL (ScrollToTop remet encore à 0).
- [ ] **Step 3 : implémenter** —
  a) `ScrollToTop.tsx` : **supprimer le premier `useEffect`** (celui qui fait `document.body.scrollTop = 0` sur changement de `pathname`) et le `handledPathRef` s'il ne sert plus qu'à ça. **Garder** le second `useEffect` (nettoyage `clearTransition`) et les exports `shouldRestoreProjectScroll`, `isTransitionRoute`. Résultat :
```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { usePageTransition } from '../context/PageTransitionContext';
import type { ProjectTransitionSnapshot } from '../utils/projectTransition';

type TransitionRoute = Pick<ProjectTransitionSnapshot, 'originPath' | 'projectLink'>;

export const shouldRestoreProjectScroll = (pathname: string) => pathname === '/projets';

export const isTransitionRoute = (pathname: string, snapshot: TransitionRoute | null) =>
  Boolean(
    snapshot && (pathname === snapshot.originPath || pathname === snapshot.projectLink),
  );

// Le reset du scroll est désormais géré par RouteTransition (au swap). Ce
// composant ne conserve que le nettoyage d'un snapshot de morph devenu obsolète.
export function ScrollToTop() {
  const { pathname } = useLocation();
  const { snapshot, clearTransition } = usePageTransition();

  useEffect(() => {
    if (snapshot && !isTransitionRoute(pathname, snapshot)) {
      clearTransition();
    }
  }, [pathname, snapshot, clearTransition]);

  return null;
}
```
  b) `App.tsx` : envelopper les routes dans `RouteTransition`. Remplacer le bloc `<Suspense><Routes location={location}>…</Routes></Suspense>` de `AppContent` par (les `<Route>` deviennent enfants de `RouteTransition`) :
```tsx
      <Suspense fallback={null}>
        <RouteTransition>
          <Route path={ROUTES.HOME} element={<Home showSplash={showSplash} />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path={ROUTES.MENTIONS} element={<MentionsLegales />} />
          <Route path={ROUTES.APROPOS} element={<APropos />} />
          <Route path={ROUTES.PROJETS} element={<Projets />} />
          <Route path={ROUTES.PROJET_DETAIL_PATTERN} element={<ProjetDetail />} />
          <Route path="*" element={<NotFound />} />
        </RouteTransition>
      </Suspense>
```
  Ajouter l'import `import { RouteTransition } from './components/RouteTransition';`. Retirer l'usage de `location` dans `AppContent` s'il n'est plus référencé (le `useLocation()` de `AppContent` peut être supprimé si inutilisé — `RouteTransition` a le sien). Garder `<ScrollToTop />`.
- [ ] **Step 4 : vérifs** — `npx vitest run` (tout vert), `npx tsc --noEmit` (clean), `npx biome lint src` (pas de nouveau finding vs baseline), `npm run build` (OK), `npm run budget` (≤ 190 kB).
- [ ] **Step 5 : commit** — `git add -A && git commit -m "feat(transition): brancher RouteTransition dans App + alléger ScrollToTop"`

---

## Après les tâches (contrôleur, hors sous-agents)
- **Calibrage visuel** : lancer `npm run build` + preview, filmer/capturer une navigation (Accueil→Projets, Projets→À propos, retour). Ajuster si besoin les vh du voile (`Y_BELOW`/`Y_COVER`/`Y_ABOVE`, hauteur 200vh, stops 20/80 %) pour que le cœur opaque couvre 100 % du viewport et que les bords restent doux ; vérifier la durée (0.45s/phase) et l'easing.
- **Coexistence morph** : vérifier que le morph carte→détail et le retour détail→liste **ne déclenchent pas** le voile (swap immédiat) et fonctionnent comme avant ; vérifier qu'aucun flash de page n'apparaît avant couverture sur les navigations normales.
- **Reduced-motion** : vérifier le swap instantané.
- **Review finale** whole-branch (opus) puis `finishing-a-development-branch`.
