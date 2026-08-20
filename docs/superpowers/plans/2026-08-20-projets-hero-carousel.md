# Projets — hero-carousel éditorial · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la mosaïque de `/projets` par un hero-carousel éditorial plein écran câblé aux 10 vrais projets, en conservant le morph image→page projet (aller et retour).

**Architecture:** Un composant présentational `HeroCarousel` (porté depuis le composant fourni, adapté à notre stack + typo). `Projets.tsx` le pilote : mappe les projets → items, gère le morph aller (clic carte focus) via `onItemActivate`, et le morph retour en focalisant la carte du projet d'origine et en récupérant son `<img>` via `onFocusedImageChange`.

**Tech Stack:** React 19 · Vite · TypeScript · Tailwind v4 (config CSS) · `motion/react` (pkg `motion`) · Vitest + @testing-library/react · Biome.

**Spec:** `docs/superpowers/specs/2026-08-20-projets-hero-carousel-design.md`

## Global Constraints
- Import motion depuis **`motion/react`** (jamais `framer-motion`). Pkg `motion` déjà installé — **aucune install**.
- `cn` depuis **`@/lib/utils`**. Alias `@/*` → `./src/*`.
- Typo : titre + textes en **`Manrope, sans-serif`** ; labels (credit, meta, numéros du rail) en pile **mono** `ui-monospace, SFMono-Regular, Menlo, monospace`.
- **Morph inchangé côté contexte** : réutiliser `usePageTransition`, `captureSnapshot`, `beginForward`, `beginReverse`, `roundTransitionRect`, `getProjectTransitionTiming`, `prefersReducedProjectMotion`, `preloadProjetDetail` — mêmes signatures qu'aujourd'hui.
- `credit` = discipline traduite (`MOBILE`/`WEB`/`BRANDING`) ; `meta` = `[year]`.
- Bilingue via `useT`/`useLang` (FR canonique). `projetsData.i18n.test.ts` exige `en.tags.length === fr.tags.length` — ne pas casser (on ne touche pas aux tags).
- Budget ≤ 190 kB gzip. tsc, Biome, tests, build verts.

---

## File Structure
- **Create** `src/app/components/common/HeroCarousel.tsx` — le carousel présentational (adapté).
- **Create** `src/app/components/common/HeroCarousel.test.tsx` — tests du composant.
- **Modify** `src/app/data/projetsData.ts` — champ `accent` sur `Projet` + 10 valeurs + exposition.
- **Modify** `src/app/data/projetsData.categories.test.ts` — assert `accent` présent/valide.
- **Modify** `src/app/pages/Projets.tsx` — réécriture autour du carousel.
- **Modify** `src/app/pages/Projets.test.tsx` — adapté (mock HeroCarousel).
- **Modify** `src/app/pages/Projets.css` — retrait styles mosaïque, styles page carousel.
- **Delete (Task 4, si inutilisés ailleurs)** `ProjetTile.tsx`+`.css`+tests, `FilterBar.tsx`+`.css`+tests, `filterProjets.ts`+test.

---

## Task 1 : Donnée `accent` par projet

**Files:**
- Modify: `src/app/data/projetsData.ts`
- Test: `src/app/data/projetsData.categories.test.ts`

**Interfaces:**
- Produces: chaque objet exposé par `getTousProjets(lang)` et `tousProjets` a `accent: string` (hex `#RRGGBB`).

- [ ] **Step 1 : test qui échoue** — ajouter dans `projetsData.categories.test.ts` :
```ts
import { tousProjets } from './projetsData';

it('chaque projet a un accent hex valide', () => {
  for (const p of tousProjets) {
    expect(p.accent, `accent manquant pour ${p.link}`).toMatch(/^#[0-9a-fA-F]{6}$/);
  }
});
```
- [ ] **Step 2 : lancer, voir échouer** — `npx vitest run src/app/data/projetsData.categories.test.ts` → FAIL (`accent` undefined).
- [ ] **Step 3 : implémenter.**
  - Dans `interface Projet` (après `tileSize?`), ajouter : `accent?: string;`
  - Ajouter `accent` sur les 10 entrées de `projetsData` (valeurs curées, ajustables) :
    - `mauni` → `accent: '#E4674F',`
    - `onboarding-rh` → `accent: '#10B981',`
    - `syma` → `accent: '#18233F',`
    - `trackit` → `accent: '#F56416',`
    - `parcours-spvieassurances` → `accent: '#12C69A',`
    - `crm-bigbroker` → `accent: '#05D7CD',`
    - `agpt` → `accent: '#E93C8C',`
    - `refonte-spvie` → `accent: '#0A9D7A',`
    - `charte-spvie` → `accent: '#1F6F5C',`
    - `mobile-cgrm` → `accent: '#2BB3C0',`
  - Dans **les deux** mappings qui construisent les objets sortis (`tousProjets` et `getTousProjets`), exposer `accent: projet.accent ?? '#8a8a8a',` (à côté de `category`/`tileSize`).
- [ ] **Step 4 : lancer, voir passer** — `npx vitest run src/app/data/projetsData.categories.test.ts` → PASS.
- [ ] **Step 5 : commit** — `git add -A && git commit -m "feat(projets): accent signature par projet (donnée)"`

---

## Task 2 : Composant `HeroCarousel` (porté + adapté)

**Files:**
- Create: `src/app/components/common/HeroCarousel.tsx`
- Test: `src/app/components/common/HeroCarousel.test.tsx`

**Interfaces:**
- Produces:
  - `export interface HeroCarouselItem { id?: string | number; title: string; image: string; credit?: string; meta?: string[]; accent?: string }`
  - `export interface HeroCarouselProps { items: HeroCarouselItem[]; index?: number; defaultIndex?: number; onIndexChange?: (i: number) => void; onItemActivate?: (index: number, img: HTMLImageElement | null) => void; onFocusedImageChange?: (img: HTMLImageElement | null) => void; ctaLabel?: string; autoplay?: boolean; autoplayDelay?: number; className?: string }`
  - `export function HeroCarousel(props): JSX.Element`
- Consumes (Task 3 s'appuie dessus) : `onItemActivate(index, img)` tiré au clic sur la carte **déjà focus** et sur le cue CTA ; `onFocusedImageChange(img)` tiré à chaque changement d'index (et au montage) avec le `<img>` de la carte focus.

- [ ] **Step 1 : test qui échoue** — créer `HeroCarousel.test.tsx` :
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroCarousel, type HeroCarouselItem } from './HeroCarousel';

// jsdom n'a pas ResizeObserver : mock minimal.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const ITEMS: HeroCarouselItem[] = [
  { id: 'a', title: 'Alpha', image: 'a.jpg', credit: 'MOBILE', meta: ['2026'], accent: '#E4674F' },
  { id: 'b', title: 'Beta', image: 'b.jpg', credit: 'WEB', meta: ['2025'], accent: '#10B981' },
  { id: 'c', title: 'Gamma', image: 'c.jpg', credit: 'BRANDING', meta: ['2024'], accent: '#18233F' },
];

it('rend une carte par item et marque la carte focus', () => {
  render(<HeroCarousel items={ITEMS} defaultIndex={1} />);
  const cards = screen.getAllByRole('button', { name: /Alpha|Beta|Gamma/ });
  expect(cards).toHaveLength(3);
  expect(screen.getByRole('button', { name: 'Beta' })).toHaveAttribute('aria-current', 'true');
});

it('onItemActivate est appelé quand on clique la carte focus (pas les autres)', () => {
  const onItemActivate = vi.fn();
  const onIndexChange = vi.fn();
  render(
    <HeroCarousel items={ITEMS} defaultIndex={1} onItemActivate={onItemActivate} onIndexChange={onIndexChange} />,
  );
  // clic carte NON focus → focus (onIndexChange), pas d'activation
  fireEvent.click(screen.getByRole('button', { name: 'Gamma' }));
  expect(onIndexChange).toHaveBeenCalledWith(2);
  expect(onItemActivate).not.toHaveBeenCalled();
  // clic carte focus → activation avec (index, img)
  fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
  expect(onItemActivate).toHaveBeenCalledTimes(1);
  expect(onItemActivate.mock.calls[0][0]).toBe(1);
  expect(onItemActivate.mock.calls[0][1]).toBeInstanceOf(HTMLImageElement);
});

it('le cue CTA déclenche onItemActivate sur l’index courant', () => {
  const onItemActivate = vi.fn();
  render(<HeroCarousel items={ITEMS} defaultIndex={0} onItemActivate={onItemActivate} ctaLabel="Voir le projet" />);
  fireEvent.click(screen.getByRole('button', { name: /Voir le projet/i }));
  expect(onItemActivate).toHaveBeenCalledWith(0, expect.anything());
});

it('la flèche droite change l’index', () => {
  const onIndexChange = vi.fn();
  render(<HeroCarousel items={ITEMS} defaultIndex={0} onIndexChange={onIndexChange} />);
  const stage = screen.getByRole('group', { name: /projets|carousel|featured/i });
  fireEvent.keyDown(stage, { key: 'ArrowRight' });
  expect(onIndexChange).toHaveBeenCalledWith(1);
});
```
- [ ] **Step 2 : lancer, voir échouer** — `npx vitest run src/app/components/common/HeroCarousel.test.tsx` → FAIL (module absent).
- [ ] **Step 3 : implémenter** — créer `HeroCarousel.tsx` avec **exactement** cette source (portage du composant fourni + adaptations : import `motion/react`, `cn`, typo Manrope/mono, top-bar retirée, ajout `onItemActivate`/`onFocusedImageChange`/cue CTA) :

```tsx
'use client';

// Hero éditorial piloté par une pellicule. Cf. spec
// 2026-08-20-projets-hero-carousel-design.md. Géométrie mesurée (ResizeObserver),
// jamais codée en dur : identique en preview 600px et en 4K.
import * as React from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import { cn } from '@/lib/utils';

export interface HeroCarouselItem {
  id?: string | number;
  title: string;
  image: string;
  credit?: string;
  meta?: string[];
  accent?: string;
}

export interface HeroCarouselProps {
  items: HeroCarouselItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Tiré au clic sur la carte DÉJÀ focus (i === index) et sur le cue CTA. */
  onItemActivate?: (index: number, img: HTMLImageElement | null) => void;
  /** Tiré à chaque changement d'index (+ au montage) avec le <img> de la carte focus. */
  onFocusedImageChange?: (img: HTMLImageElement | null) => void;
  /** Libellé du cue d'ouverture (ex. « Voir le projet »). Masqué si absent. */
  ctaLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
}

const CARD_H = 0.264;
const CARD_AR = 0.75;
const GAP = 0.038;
const STRIP_TOP = 0.5;
const TITLE = 0.067;
const LABEL = 0.0103;
const PAD = 0.017;
const RAIL = 0.2;
const WHEEL_THRESHOLD = 60;
const WHEEL_COOLDOWN = 420;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function HeroCarousel({
  items,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  onItemActivate,
  onFocusedImageChange,
  ctaLabel,
  autoplay = false,
  autoplayDelay = 4000,
  className,
}: HeroCarouselProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
  const [dragging, setDragging] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const reduced = useReducedMotion();

  const last = items.length - 1;
  const index = clamp(controlled ?? uncontrolled, 0, Math.max(0, last));

  const go = React.useCallback(
    (next: number) => {
      const clamped = clamp(next, 0, Math.max(0, last));
      if (controlled === undefined) setUncontrolled(clamped);
      if (clamped !== index) onIndexChange?.(clamped);
    },
    [controlled, index, last, onIndexChange],
  );

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const read = () => setBox({ w: stage.clientWidth, h: stage.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const fullH = clamp(box.h * CARD_H, 96, 360);
  const halfH = fullH / 2;
  const cardW = fullH * CARD_AR;
  const gap = Math.max(4, Math.round(cardW * GAP));
  const step = cardW + gap;
  const pad = Math.max(16, Math.round(box.w * PAD));
  const label = Math.max(9, Math.round(box.h * LABEL));

  const xFor = React.useCallback(
    (i: number) => box.w / 2 - (i * step + cardW / 2),
    [box.w, step, cardW],
  );
  const x = useMotionValue(0);
  const target = xFor(index);

  const spring = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 34, mass: 0.9 };
  const swing = reduced
    ? { duration: 0 }
    : { duration: 0.7, ease: 'easeOut' as const };

  React.useEffect(() => {
    if (dragging) return;
    const run = animate(x, target, spring);
    return () => run.stop();
  }, [target, dragging, reduced, x]); // eslint-disable-line react-hooks/exhaustive-deps

  // Remonte l'image de la carte focus au parent (pour le reverse-morph).
  React.useEffect(() => {
    if (!onFocusedImageChange) return;
    const img = stageRef.current?.querySelector<HTMLImageElement>(
      '[data-hc-card][aria-current="true"] img',
    );
    onFocusedImageChange(img ?? null);
  }, [index, box.w, onFocusedImageChange]);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let acc = 0;
    let until = 0;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const stuck = (delta > 0 && index === last) || (delta < 0 && index === 0);
      if (stuck) {
        acc = 0;
        return;
      }
      e.preventDefault();
      const now = e.timeStamp;
      if (now < until) return;
      acc += delta;
      if (Math.abs(acc) < WHEEL_THRESHOLD) return;
      go(index + Math.sign(acc));
      acc = 0;
      until = now + WHEEL_COOLDOWN;
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [go, index, last]);

  React.useEffect(() => {
    if (!autoplay || paused || dragging || items.length < 2) return;
    const id = window.setTimeout(
      () => go(index === last ? 0 : index + 1),
      autoplayDelay,
    );
    return () => window.clearTimeout(id);
  }, [autoplay, autoplayDelay, dragging, go, index, items.length, last, paused]);

  const active = items[index];
  if (!active) return null;

  const lines = active.title.split('\n');
  const accent = active.accent ?? '#8a8a8a';

  const activate = () => {
    const img = stageRef.current?.querySelector<HTMLImageElement>(
      '[data-hc-card][aria-current="true"] img',
    );
    onItemActivate?.(index, img ?? null);
  };

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Projets"
      onKeyDown={(e) => {
        const keys: Record<string, number> = {
          ArrowLeft: index - 1,
          ArrowRight: index + 1,
          Home: 0,
          End: last,
        };
        if (e.key === 'Enter') {
          e.preventDefault();
          activate();
          return;
        }
        if (!(e.key in keys)) return;
        e.preventDefault();
        go(keys[e.key]!);
      }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ fontFamily: 'Manrope, sans-serif' }}
      className={cn(
        'relative h-full min-h-[24rem] w-full overflow-hidden bg-black text-white select-none',
        'outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-inset',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={swing}
        >
          <motion.img
            src={active.image}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: reduced ? 1.28 : 1.42 }}
            animate={{ scale: 1.28 }}
            transition={reduced ? { duration: 0 } : { duration: 6, ease: 'linear' }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: accent, mixBlendMode: 'color' }} />
          <div className="absolute inset-0 opacity-55" style={{ backgroundColor: accent, mixBlendMode: 'multiply' }} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/45" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }}
      />

      {/* Bloc titre au-dessus de la pellicule */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col justify-end"
        style={{
          height: `${STRIP_TOP * 100}%`,
          paddingLeft: pad,
          paddingRight: pad,
          paddingBottom: Math.round(box.h * 0.028),
        }}
      >
        <div className="flex w-full flex-wrap items-end gap-x-[6vw] gap-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h2
              key={index}
              className="font-semibold leading-[0.88] tracking-[-0.03em]"
              style={{ fontSize: Math.max(24, Math.round(box.h * TITLE)) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
            >
              {lines.map((line, i) => (
                <span key={i} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={
                      reduced ? { duration: 0 } : { duration: 0.62, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }
                    }
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h2>
          </AnimatePresence>

          {active.credit ? (
            <motion.p
              key={`credit-${index}`}
              className="uppercase tracking-[0.14em] opacity-80"
              style={{ fontFamily: MONO, fontSize: label }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {active.credit}
            </motion.p>
          ) : null}

          {active.meta?.length ? (
            <div className="ml-auto flex items-end" style={{ gap: `${Math.max(16, box.w * 0.055)}px` }}>
              {active.meta.map((fact, i) => (
                <motion.span
                  key={`${index}-${fact}`}
                  className="whitespace-nowrap uppercase tracking-[0.14em] opacity-80"
                  style={{ fontFamily: MONO, fontSize: label }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.45, delay: 0.12 + i * 0.06 }}
                >
                  {fact}
                </motion.span>
              ))}
            </div>
          ) : null}
        </div>

        {ctaLabel ? (
          <button
            type="button"
            onClick={activate}
            className="mt-3 inline-flex w-fit items-center gap-1.5 uppercase tracking-[0.14em] opacity-90 transition-opacity hover:opacity-100"
            style={{ fontFamily: MONO, fontSize: label }}
          >
            {ctaLabel} <span aria-hidden>↗</span>
          </button>
        ) : null}
      </div>

      {/* Pellicule */}
      <div className="absolute inset-x-0" style={{ top: `${STRIP_TOP * 100}%`, height: fullH }}>
        <motion.div
          className="flex items-start"
          style={{ gap, x, cursor: dragging ? 'grabbing' : 'grab' }}
          drag="x"
          dragMomentum={false}
          dragElastic={0.08}
          dragConstraints={{ left: xFor(last), right: xFor(0) }}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_, info) => {
            setDragging(false);
            const thrown = x.get() + info.velocity.x * 0.12;
            go(Math.round((box.w / 2 - thrown - cardW / 2) / step));
          }}
        >
          {items.map((item, i) => (
            <motion.button
              key={item.id ?? i}
              type="button"
              data-hc-card
              aria-label={item.title.replace(/\n/g, ' ')}
              aria-current={i === index}
              onClick={() => {
                if (i === index) activate();
                else go(i);
              }}
              className="relative shrink-0 overflow-hidden rounded-none bg-white/5"
              style={{ width: cardW }}
              animate={{ height: i === index ? fullH : halfH }}
              transition={spring}
            >
              <img
                src={item.image}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
                style={{ objectPosition: '50% 26%' }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-black"
                animate={{ opacity: i === index ? 0 : 0.12 }}
                transition={spring}
              />
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Rail de position */}
      <div className="absolute" style={{ left: pad, bottom: Math.max(14, box.h * 0.022), width: box.w * RAIL }}>
        <div className="flex justify-between tabular-nums opacity-80" style={{ fontFamily: MONO, fontSize: label }}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{String(items.length).padStart(2, '0')}</span>
        </div>
        <div className="relative mt-2 h-px w-full bg-white/25">
          <motion.div
            className="absolute inset-y-0 bg-white"
            style={{ width: `${100 / items.length}%` }}
            animate={{ left: `${(index / items.length) * 100}%` }}
            transition={spring}
          />
        </div>
      </div>
    </div>
  );
}
```
- [ ] **Step 4 : lancer, voir passer** — `npx vitest run src/app/components/common/HeroCarousel.test.tsx` → PASS (4 tests). Puis `npx tsc --noEmit` → clean, `npx biome lint src/app/components/common/HeroCarousel.tsx` → clean.
- [ ] **Step 5 : commit** — `git add -A && git commit -m "feat(projets): composant HeroCarousel (porté + adapté stack/typo)"`

---

## Task 3 : `Projets.tsx` — câblage carousel + morph

**Files:**
- Modify: `src/app/pages/Projets.tsx` (réécriture)
- Test: `src/app/pages/Projets.test.tsx`

**Interfaces:**
- Consumes : `HeroCarousel` (Task 2) — props `items`, `index`, `onIndexChange`, `onItemActivate`, `onFocusedImageChange`, `ctaLabel` ; `getTousProjets(lang)` avec `accent` (Task 1).

- [ ] **Step 1 : test qui échoue** — remplacer le contenu de `Projets.test.tsx` par :
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import Projets from './Projets';

const captureSnapshot = vi.fn();
const beginForward = vi.fn();
const beginReverse = vi.fn();
const clearTransition = vi.fn();
vi.mock('../context/PageTransitionContext', () => ({
  usePageTransition: () => ({
    snapshot: null,
    direction: null,
    captureSnapshot,
    beginForward,
    beginReverse,
    clearTransition,
    isTransitioning: false,
  }),
}));

// Mock du carousel : expose les items + un bouton pour déclencher onItemActivate.
vi.mock('../components/common/HeroCarousel', () => ({
  HeroCarousel: ({ items, onItemActivate }: any) => (
    <div data-testid="carousel">
      <span data-testid="count">{items.length}</span>
      <span data-testid="first-credit">{items[0].credit}</span>
      <span data-testid="first-meta">{items[0].meta?.[0]}</span>
      <span data-testid="first-accent">{items[0].accent}</span>
      <button type="button" onClick={() => onItemActivate?.(0, document.createElement('img'))}>
        activate-0
      </button>
    </div>
  ),
}));

const renderProjets = () =>
  render(
    <MemoryRouter initialEntries={['/projets']}>
      <Projets />
    </MemoryRouter>,
  );

it('câble les 10 projets au carousel', () => {
  renderProjets();
  expect(screen.getByTestId('count').textContent).toBe('10');
});

it('mappe credit=discipline, meta=année, accent', () => {
  renderProjets();
  expect(screen.getByTestId('first-credit').textContent).toMatch(/MOBILE|WEB|BRANDING/);
  expect(screen.getByTestId('first-meta').textContent).toMatch(/^\d{4}/);
  expect(screen.getByTestId('first-accent').textContent).toMatch(/^#[0-9a-fA-F]{6}$/);
});

it('onItemActivate déclenche le morph (captureSnapshot + beginForward)', () => {
  renderProjets();
  fireEvent.click(screen.getByText('activate-0'));
  expect(captureSnapshot).toHaveBeenCalledTimes(0); // morph normal → beginForward (pas reduce)
  expect(beginForward).toHaveBeenCalledTimes(1);
});
```
  > Note : si l'environnement de test force `prefers-reduced-motion`, adapter la dernière assertion (`captureSnapshot` appelé, `beginForward` non). Le setup actuel ne le force pas → `beginForward`.
- [ ] **Step 2 : lancer, voir échouer** — `npx vitest run src/app/pages/Projets.test.tsx` → FAIL.
- [ ] **Step 3 : implémenter** — réécrire `Projets.tsx` :
```tsx
import './Projets.css';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import ContactFooter from '../components/ContactFooter';
import { HeroCarousel, type HeroCarouselItem } from '../components/common/HeroCarousel';
import PageMeta from '../components/PageMeta';
import { getTousProjets } from '../data/projetsData';
import { ROUTES } from '../config';
import { ROUTE_META } from '../config/seo';
import { useLang, useT } from '../i18n';
import { usePageTransition } from '../context/PageTransitionContext';
import {
  getProjectTransitionTiming,
  prefersReducedProjectMotion,
  roundTransitionRect,
} from '../utils/projectTransition';
import {
  resolveInitialProjetsScroll,
  saveProjetsScroll,
} from '../utils/projetsScroll';
import { preloadProjetDetail } from './preloadProjetDetail';

const STRINGS = {
  fr: { cta: 'Voir le projet', cat: { mobile: 'MOBILE', web: 'WEB', branding: 'BRANDING' } },
  en: { cta: 'View project', cat: { mobile: 'MOBILE', web: 'WEB', branding: 'BRANDING' } },
};

export default function Projets() {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const tousProjets = getTousProjets(lang);
  const location = useLocation();
  const navigate = useNavigate();
  const { snapshot, direction, captureSnapshot, beginForward, beginReverse, clearTransition, isTransitioning } =
    usePageTransition();

  const items: HeroCarouselItem[] = tousProjets.map((p) => ({
    id: p.link,
    title: p.text,
    image: p.image,
    credit: t.cat[p.category as 'mobile' | 'web' | 'branding'],
    meta: [p.year],
    accent: p.accent,
  }));

  const [isReturnVisit] = useState(
    () => snapshot?.originPath === '/projets' && location.pathname === '/projets',
  );
  const [reduceReturnMotion] = useState(() => prefersReducedProjectMotion());
  const [mountSnapshot] = useState(() => snapshot);
  const [mountDirection] = useState(() => direction);
  const shouldStartReverse =
    isReturnVisit && mountSnapshot !== null && mountDirection !== 'reverse';

  // Index de départ = carte du projet d'origine si retour, sinon 0.
  const returnIndex = mountSnapshot
    ? Math.max(0, tousProjets.findIndex((p) => p.link === mountSnapshot.projectLink))
    : 0;
  const [index, setIndex] = useState(isReturnVisit ? returnIndex : 0);
  const focusedImageRef = useRef<HTMLImageElement | null>(null);
  const reverseStartedRef = useRef(false);

  const initialScrollRef = useRef(resolveInitialProjetsScroll(snapshot));
  useLayoutEffect(() => {
    document.body.scrollTop = initialScrollRef.current;
  }, []);

  useEffect(() => {
    const onScroll = () => saveProjetsScroll(document.body.scrollTop);
    document.body.addEventListener('scroll', onScroll, { passive: true });
    return () => document.body.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(preloadProjetDetail, 300);
    return () => clearTimeout(timer);
  }, []);

  // Morph aller : clic sur la carte focus (ou cue CTA) — logique de ProjetTile.
  const handleActivate = (i: number, img: HTMLImageElement | null) => {
    const projet = tousProjets[i];
    if (!projet || !img || isTransitioning) return;
    const nextSnapshot = {
      imageSrc: projet.image,
      imageRect: roundTransitionRect(img.getBoundingClientRect()),
      projectLink: projet.link,
      originPath: location.pathname,
      scrollTop: document.body.scrollTop,
    };
    if (prefersReducedProjectMotion()) {
      captureSnapshot(nextSnapshot);
      navigate(projet.link);
      return;
    }
    const timing = getProjectTransitionTiming(window.innerWidth, 'forward');
    beginForward(nextSnapshot);
    window.setTimeout(() => navigate(projet.link), timing.navigateDelay);
  };

  // Morph retour : quand la carte focus (du projet d'origine) expose son image.
  const handleFocusedImageChange = (img: HTMLImageElement | null) => {
    focusedImageRef.current = img;
    if (!shouldStartReverse || reverseStartedRef.current || !mountSnapshot) return;
    if (img == null || tousProjets[index]?.link !== mountSnapshot.projectLink) return;
    reverseStartedRef.current = true;
    if (reduceReturnMotion) {
      clearTransition();
      return;
    }
    beginReverse(roundTransitionRect(img.getBoundingClientRect()));
  };

  // Filet de sécurité : si l'image de la carte focus n'arrive jamais.
  useLayoutEffect(() => {
    if (!shouldStartReverse) return;
    const id = window.setTimeout(() => {
      if (!reverseStartedRef.current) {
        reverseStartedRef.current = true;
        clearTransition();
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [shouldStartReverse, clearTransition]);

  return (
    <div className="projets-page" style={{ backgroundColor: 'var(--portfolio-bg)' }}>
      <PageMeta {...ROUTE_META[ROUTES.PROJETS]} />
      <div className="projets-carousel-stage">
        <HeroCarousel
          items={items}
          index={index}
          onIndexChange={setIndex}
          onItemActivate={handleActivate}
          onFocusedImageChange={handleFocusedImageChange}
          ctaLabel={t.cta}
        />
      </div>
      <ContactFooter />
    </div>
  );
}
```
- [ ] **Step 4 : lancer, voir passer** — `npx vitest run src/app/pages/Projets.test.tsx` → PASS. Puis `npx tsc --noEmit` → clean.
- [ ] **Step 5 : commit** — `git add -A && git commit -m "feat(projets): /projets en hero-carousel + morph aller/retour"`

---

## Task 4 : Layout CSS + nettoyage mosaïque

**Files:**
- Modify: `src/app/pages/Projets.css`
- Delete (si inutilisés ailleurs) : `src/app/components/common/ProjetTile.tsx` + `.css` + `ProjetTile.test.tsx`, `src/app/components/common/FilterBar.tsx` + `.css` + `FilterBar.test.tsx`, `src/app/utils/filterProjets.ts` + `filterProjets.test.ts`.

- [ ] **Step 1 : vérifier les usages** — `grep -rn "ProjetTile\|FilterBar\|filterProjets" src` . Attendu : références **uniquement** dans les fichiers ci-dessus + `Projets.tsx` (déjà nettoyé en Task 3). `NewProjectCard` doit rester référencé par `ProjetDetail.tsx`.
- [ ] **Step 2 : CSS** — remplacer le contenu de `Projets.css` par :
```css
/* Page /projets : le hero-carousel occupe le plein écran, le footer suit. */
.projets-page {
  min-height: 100vh;
}
.projets-carousel-stage {
  width: 100%;
  height: 100vh;
  height: 100dvh;
}
```
- [ ] **Step 3 : supprimer les fichiers mosaïque** (seulement si Step 1 confirme qu'ils ne sont plus utilisés hors d'eux-mêmes) :
```bash
git rm src/app/components/common/ProjetTile.tsx src/app/components/common/ProjetTile.css src/app/components/common/ProjetTile.test.tsx \
       src/app/components/common/FilterBar.tsx src/app/components/common/FilterBar.css src/app/components/common/FilterBar.test.tsx \
       src/app/utils/filterProjets.ts src/app/utils/filterProjets.test.ts
```
  > Si l'un d'eux est utilisé ailleurs (hors `/projets`), NE PAS le supprimer et le signaler au contrôleur.
- [ ] **Step 4 : vérifs** — `npx tsc --noEmit` (clean), `npx vitest run` (tout vert, les tests supprimés n'existent plus), `npx biome lint src` (pas de nouveau finding), `npm run build` (OK), `npm run budget` (≤ 190 kB).
- [ ] **Step 5 : commit** — `git add -A && git commit -m "chore(projets): layout carousel + retrait mosaïque (ProjetTile/FilterBar/filterProjets)"`

---

## Après les tâches (contrôleur, hors sous-agents)
- **Calibrage visuel** : captures desktop light+dark, mobile (< 640px) — vérifier lisibilité pellicule/titre/rail, ajuster les ratios (`CARD_H`, `PAD`…) sous breakpoint si besoin ; vérifier que le fond vire bien à l'accent de chaque projet ; footer atteignable en bout de pellicule.
- **Parité morph** : tester aller (clic carte focus → morph plein écran → détail) ET retour (détail → /projets focus le bon projet → reverse-morph).
- **Review finale** whole-branch (opus) puis `finishing-a-development-branch`.
