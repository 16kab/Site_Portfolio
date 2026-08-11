# Page Projets — mosaïque éditoriale filtrable · Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Remplacer la liste verticale texte-riche de `/projets` par une mosaïque éditoriale d'images filtrable par discipline (Mobile · Web · Branding), en conservant le morph d'ouverture d'image et les hovers (bouton `RollingText`, bordures `BorderGlow`).

**Architecture :** `Projets.tsx` porte l'état de filtre et rend `<FilterBar>` + une grille de `<ProjetTile>` (refactor de `NewProjectCard` : même logique de morph, présentation en tuile). Le tri recompose la mosaïque via framer-motion `layout` + `AnimatePresence`. Un champ `category` + `tileSize` est ajouté aux données.

**Tech Stack :** React 19 + TypeScript, react-router, `motion/react` (framer-motion), Tailwind (classes utilitaires) + CSS scopé, Vitest + @testing-library/react, Biome.

## Global Constraints
- Le morph (`PageTransitionContext` / `PageTransitionOverlay`) est **inchangé** : `ProjetTile` produit le même `snapshot` que `NewProjectCard` (`{ imageSrc, imageRect, projectLink, originPath, scrollTop }`).
- Conserver : hover **bouton** (`RollingText`), hover **bordures** (`BorderGlow`), header « Projets » + eyebrow, restauration de scroll + reverse-morph au retour (logique existante de `Projets.tsx`).
- Disciplines = 3, une seule par projet : `'mobile' | 'web' | 'branding'`. Chip `Tous` par défaut.
- `prefers-reduced-motion` respecté (pas de FLIP ni lift ; morph déjà géré).
- Bilingue : les libellés de `FilterBar` passent par `useT`. Le mapping `category`/`tileSize` est non-traduit (dans `projetsData`).
- Vérifs à chaque commit : `npx tsc --noEmit`, `npx vitest run`, `npm run build`, `npm run budget`.

---

### Task 1 : Données — `category` + `tileSize`

**Files:**
- Modify: `src/app/data/projetsData.ts` (interface `Projet` ~L32 ; les 10 objets projet ; `tousProjets` ~L619 ; `getTousProjets` ~L664)
- Test: `src/app/data/projetsData.categories.test.ts` (créer)

**Interfaces:**
- Produces: `Projet.category: 'mobile' | 'web' | 'branding'`, `Projet.tileSize?: 'l' | 's' | 'm'`. `getTousProjets(lang)[i]` et `tousProjets[i]` exposent en plus `category` et `tileSize` (défaut `'m'`).

- [ ] **Step 1 : Test qui échoue** — `src/app/data/projetsData.categories.test.ts`
```ts
import { describe, expect, it } from 'vitest';
import { projetsData, getTousProjets } from './projetsData';

const CATS = ['mobile', 'web', 'branding'] as const;
const EXPECTED: Record<string, (typeof CATS)[number]> = {
  mauni: 'mobile', trackit: 'mobile', 'mobile-cgrm': 'mobile',
  'onboarding-rh': 'web', 'refonte-spvie': 'web',
  'parcours-spvieassurances': 'web', 'crm-bigbroker': 'web',
  syma: 'branding', agpt: 'branding', 'charte-spvie': 'branding',
};

describe('projets — catégories & tailles', () => {
  it('chaque projet a une catégorie valide, conforme au mapping', () => {
    for (const p of projetsData) {
      expect(CATS).toContain(p.category);
      expect(p.category).toBe(EXPECTED[p.id]);
    }
  });
  it('tileSize, quand défini, est l/m/s', () => {
    for (const p of projetsData) {
      if (p.tileSize) expect(['l', 'm', 's']).toContain(p.tileSize);
    }
  });
  it('getTousProjets expose category et tileSize', () => {
    const list = getTousProjets('fr');
    expect(list).toHaveLength(projetsData.length);
    expect(CATS).toContain(list[0].category);
    expect(list[0]).toHaveProperty('tileSize');
  });
});
```

- [ ] **Step 2 : Vérifier l'échec** — `npx vitest run src/app/data/projetsData.categories.test.ts` → FAIL (`category` inexistant / `undefined`).

- [ ] **Step 3 : Ajouter les champs à l'interface** — dans `Projet` (après `tags: string[];`) :
```ts
  category: 'mobile' | 'web' | 'branding';
  tileSize?: 'l' | 'm' | 's';
```

- [ ] **Step 4 : Renseigner les 10 projets** — ajouter `category` (obligatoire) et `tileSize` (curé) sur chaque objet de `projetsData`. Valeurs :
  - `mauni` → `category: 'mobile', tileSize: 'l'`
  - `trackit` → `category: 'mobile', tileSize: 'm'`
  - `mobile-cgrm` → `category: 'mobile', tileSize: 'l'`
  - `onboarding-rh` → `category: 'web', tileSize: 's'`
  - `refonte-spvie` → `category: 'web', tileSize: 'm'`
  - `parcours-spvieassurances` → `category: 'web', tileSize: 's'`
  - `crm-bigbroker` → `category: 'web', tileSize: 'm'`
  - `syma` → `category: 'branding', tileSize: 'm'`
  - `agpt` → `category: 'branding', tileSize: 'l'`
  - `charte-spvie` → `category: 'branding', tileSize: 's'`

- [ ] **Step 5 : Exposer dans les mappings** — dans `tousProjets` (~L619) ET `getTousProjets` (~L664), ajouter aux objets retournés :
```ts
    category: projet.category,
    tileSize: projet.tileSize ?? 'm',
```

- [ ] **Step 6 : Vérifier** — `npx vitest run src/app/data/projetsData.categories.test.ts` → PASS ; `npx tsc --noEmit` → 0 erreur.

- [ ] **Step 7 : Commit**
```bash
git add src/app/data/projetsData.ts src/app/data/projetsData.categories.test.ts
git commit -m "feat(projets): categorie + taille de tuile par projet"
```

---

### Task 2 : Logique de filtre (util pure)

**Files:**
- Create: `src/app/utils/filterProjets.ts`
- Test: `src/app/utils/filterProjets.test.ts`

**Interfaces:**
- Produces: `export type ProjetCategory = 'mobile' | 'web' | 'branding';` · `export type FilterValue = 'all' | ProjetCategory;` · `export function filterProjets<T extends { category: string }>(projets: T[], filter: FilterValue): T[]`

- [ ] **Step 1 : Test qui échoue** — `src/app/utils/filterProjets.test.ts`
```ts
import { describe, expect, it } from 'vitest';
import { filterProjets } from './filterProjets';

const P = [
  { id: 'a', category: 'mobile' },
  { id: 'b', category: 'web' },
  { id: 'c', category: 'mobile' },
];

describe('filterProjets', () => {
  it('retourne tout pour "all"', () => {
    expect(filterProjets(P, 'all')).toHaveLength(3);
  });
  it('filtre par catégorie', () => {
    expect(filterProjets(P, 'mobile').map((p) => p.id)).toEqual(['a', 'c']);
    expect(filterProjets(P, 'web').map((p) => p.id)).toEqual(['b']);
  });
  it('préserve l\'ordre', () => {
    expect(filterProjets(P, 'mobile')[0].id).toBe('a');
  });
});
```

- [ ] **Step 2 : Vérifier l'échec** — `npx vitest run src/app/utils/filterProjets.test.ts` → FAIL (module inexistant).

- [ ] **Step 3 : Implémenter** — `src/app/utils/filterProjets.ts`
```ts
export type ProjetCategory = 'mobile' | 'web' | 'branding';
export type FilterValue = 'all' | ProjetCategory;

export function filterProjets<T extends { category: string }>(
  projets: T[],
  filter: FilterValue,
): T[] {
  if (filter === 'all') return projets;
  return projets.filter((p) => p.category === filter);
}
```

- [ ] **Step 4 : Vérifier** — `npx vitest run src/app/utils/filterProjets.test.ts` → PASS.

- [ ] **Step 5 : Commit**
```bash
git add src/app/utils/filterProjets.ts src/app/utils/filterProjets.test.ts
git commit -m "feat(projets): util de filtre par categorie"
```

---

### Task 3 : `FilterBar`

**Files:**
- Create: `src/app/components/common/FilterBar.tsx`
- Test: `src/app/components/common/FilterBar.test.tsx`

**Interfaces:**
- Consumes: `FilterValue` (Task 2).
- Produces: `export default function FilterBar({ value, onChange }: { value: FilterValue; onChange: (v: FilterValue) => void })`. Rend un `role="tablist"` avec un bouton par option ; le bouton actif porte `aria-selected="true"`. Ordre : `Tous · Mobile · Web · Branding`.

- [ ] **Step 1 : Test qui échoue** — `src/app/components/common/FilterBar.test.tsx`
```ts
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FilterBar from './FilterBar';

describe('FilterBar', () => {
  it('rend une puce par option, "Tous" actif par défaut', () => {
    render(<FilterBar value="all" onChange={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: 'Tous' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
  it('remonte le choix au clic', () => {
    const onChange = vi.fn();
    render(<FilterBar value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Mobile' }));
    expect(onChange).toHaveBeenCalledWith('mobile');
  });
  it('reflète la valeur active', () => {
    render(<FilterBar value="branding" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Branding' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
```

- [ ] **Step 2 : Vérifier l'échec** — `npx vitest run src/app/components/common/FilterBar.test.tsx` → FAIL.

- [ ] **Step 3 : Implémenter** — `src/app/components/common/FilterBar.tsx`
```tsx
import './FilterBar.css';
import { useT } from '../../i18n';
import type { FilterValue } from '../../utils/filterProjets';

const STRINGS = {
  fr: { all: 'Tous', mobile: 'Mobile', web: 'Web', branding: 'Branding' },
  en: { all: 'All', mobile: 'Mobile', web: 'Web', branding: 'Branding' },
};

const ORDER: FilterValue[] = ['all', 'mobile', 'web', 'branding'];

export default function FilterBar({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const t = useT(STRINGS);
  return (
    <div className="filter-bar" role="tablist" aria-label="Filtrer par discipline">
      {ORDER.map((v) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          className={`filter-chip${value === v ? ' on' : ''}`}
          onClick={() => onChange(v)}
        >
          {t[v]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4 : CSS** — `src/app/components/common/FilterBar.css`
```css
.filter-bar { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 clamp(24px, 4vw, 44px); }
.filter-chip { font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 500; padding: 8px 18px; border-radius: 999px; border: 1px solid var(--portfolio-card-border); background: transparent; color: var(--portfolio-text-secondary); cursor: pointer; transition: color .25s, background .25s, border-color .25s; }
.filter-chip:hover { color: var(--portfolio-text-primary); border-color: var(--portfolio-text-muted); }
.filter-chip.on { background: var(--portfolio-button-bg); color: var(--portfolio-button-text); border-color: transparent; }
.filter-chip:focus-visible { outline: 2px solid var(--portfolio-text-primary); outline-offset: 2px; }
@media (max-width: 640px) { .filter-bar { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; } .filter-bar::-webkit-scrollbar { display: none; } .filter-chip { flex: none; } }
```

- [ ] **Step 5 : Vérifier** — `npx vitest run src/app/components/common/FilterBar.test.tsx` → PASS.

- [ ] **Step 6 : Commit**
```bash
git add src/app/components/common/FilterBar.tsx src/app/components/common/FilterBar.css src/app/components/common/FilterBar.test.tsx
git commit -m "feat(projets): FilterBar (chips discipline)"
```

---

### Task 4 : `ProjetTile` (refactor de `NewProjectCard`)

**Files:**
- Create: `src/app/components/common/ProjetTile.tsx`
- Create: `src/app/components/common/ProjetTile.css`
- Test: `src/app/components/common/ProjetTile.test.tsx`
- Reference (logique morph à porter à l'identique) : `src/app/components/common/NewProjectCard.tsx`

**Interfaces:**
- Consumes: `BorderGlow`, `RollingText`, `usePageTransition`, `getProjectTransitionTiming`, `prefersReducedProjectMotion`, `roundTransitionRect`, `preloadProjetDetail`, `svgPaths`.
- Produces: `forwardRef<HTMLImageElement, { link: string; title: string; category: 'mobile'|'web'|'branding'; image?: string; tileSize?: 'l'|'m'|'s'; priority?: boolean }>`. La `ref` pointe l'`<img>` (pour le reverse-morph). Le conteneur image porte `imageContainerRef` (source du morph). Classe racine `project-tile tile-<size>`.

- [ ] **Step 1 : Tests qui échouent** — `src/app/components/common/ProjetTile.test.tsx` (porte les tests morph de `NewProjectCard.test.tsx` + tests tuile). Reprendre **tel quel** le corps de `NewProjectCard.test.tsx` en remplaçant l'import/rendu par `ProjetTile` avec ces props :
```tsx
<ProjetTile
  ref={ref}
  link="/projets/test"
  title="Projet test"
  category="mobile"
  image="/test.webp"
  tileSize="l"
/>
```
et le mock `../RollingText` inchangé. Conserver les 8 tests morph existants (glow, lien unique, rolling hover/focus, forward-ref image, clic modifié natif, transition avant navigation mobile, un seul timer sur double-clic, annulation à l'unmount, navigation immédiate en reduced-motion). **Ajouter** 2 tests tuile :
```tsx
it('affiche le titre et la discipline en repos', () => {
  renderCard();
  expect(screen.getByText('Projet test')).toBeVisible();
  expect(screen.getByText('Mobile')).toBeVisible();
});
it('applique la classe de taille', () => {
  const { container } = renderCard();
  expect(container.querySelector('.project-tile')).toHaveClass('tile-l');
});
```
(le helper `renderCard` de `NewProjectCard.test.tsx`, adapté aux props ci-dessus, et une map `mobile→Mobile` pour la discipline).

- [ ] **Step 2 : Vérifier l'échec** — `npx vitest run src/app/components/common/ProjetTile.test.tsx` → FAIL (module inexistant).

- [ ] **Step 3 : Implémenter** — `src/app/components/common/ProjetTile.tsx`. **Copier la logique de clic/morph de `NewProjectCard.tsx` à l'identique** (states `isHovered`/`isFocused`, `handleClick`, refs/timers, cleanup) ; seule la présentation change. Squelette :
```tsx
import './ProjetTile.css';
import { useEffect, useState, useRef, forwardRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import svgPaths from '../../../imports/svg-vvxa7ry2aa';
import RollingText from '../RollingText';
import { usePageTransition } from '../../context/PageTransitionContext';
import {
  getProjectTransitionTiming,
  prefersReducedProjectMotion,
  roundTransitionRect,
} from '../../utils/projectTransition';
import { preloadProjetDetail } from '../../pages/preloadProjetDetail';
import { useT } from '../../i18n';
import BorderGlow from './BorderGlow';

const STRINGS = {
  fr: { cta: 'Voir le projet', aria: (t: string) => `Voir le projet ${t}`,
        cat: { mobile: 'Mobile', web: 'Web', branding: 'Branding' } },
  en: { cta: 'View project', aria: (t: string) => `View project ${t}`,
        cat: { mobile: 'Mobile', web: 'Web', branding: 'Branding' } },
};

interface Props {
  link: string; title: string;
  category: 'mobile' | 'web' | 'branding';
  image?: string; tileSize?: 'l' | 'm' | 's'; priority?: boolean;
}

const ProjetTile = forwardRef<HTMLImageElement, Props>(
  ({ link, title, category, image, tileSize = 'm', priority = false }, ref) => {
    const t = useT(STRINGS);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const navigationTimerRef = useRef<number | null>(null);
    const isNavigationPendingRef = useRef(false);
    const { captureSnapshot, beginForward, isTransitioning } = usePageTransition();
    const isInteractive = isHovered || isFocused;

    // ↓↓↓ COPIER handleClick + le useEffect de cleanup DEPUIS NewProjectCard.tsx
    //     (aucune modification de comportement) ↓↓↓

    return (
      <BorderGlow className="project-tile-shell">
        <Link
          to={link}
          aria-label={t.aria(title)}
          onClick={handleClick}
          onMouseEnter={() => { setIsHovered(true); preloadProjetDetail(); }}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => { setIsFocused(true); preloadProjetDetail(); }}
          onBlur={() => setIsFocused(false)}
          className={`project-tile tile-${tileSize} group`}
        >
          <div ref={imageContainerRef} className="tile-media">
            {image && (
              <img
                ref={ref}
                src={image}
                alt={title}
                loading={priority ? undefined : 'lazy'}
                fetchPriority={priority ? 'high' : undefined}
                decoding="async"
                className="tile-image"
              />
            )}
            <div className="tile-scrim" aria-hidden="true" />
            <div className="tile-meta">
              <span className="tile-cat">{t.cat[category]}</span>
              <h3 className="tile-title">{title}</h3>
            </div>
            <span
              className="tile-cta"
              style={{
                backgroundColor: isInteractive
                  ? 'var(--portfolio-button-bg-hover)'
                  : 'var(--portfolio-button-bg)',
                color: 'var(--portfolio-button-text)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                <path d={svgPaths.p2fe73000} fill="currentColor" />
              </svg>
              <RollingText text={t.cta} inView={isInteractive}
                transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }} />
            </span>
          </div>
        </Link>
      </BorderGlow>
    );
  },
);

export default ProjetTile;
```
> Le corps de `handleClick` et le `useEffect` de cleanup sont **strictement** ceux de `NewProjectCard.tsx` (lignes ~51-110) — les recopier sans les altérer (garantit que les tests morph portés passent).

- [ ] **Step 4 : CSS** — `src/app/components/common/ProjetTile.css`
```css
.project-tile-shell { display: block; height: 100%; }
.project-tile { position: relative; display: block; width: 100%; height: 100%; border-radius: 12px; overflow: hidden; cursor: pointer; text-decoration: none; }
.project-tile .tile-media { position: relative; width: 100%; height: 100%; }
.project-tile .tile-image { width: 100%; height: 100%; object-fit: cover; object-position: center; transition: transform .6s cubic-bezier(.16,1,.3,1); }
.project-tile:hover .tile-image, .project-tile:focus-visible .tile-image { transform: scale(1.045); }
.project-tile .tile-scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(6,10,14,0.72) 0%, rgba(6,10,14,0.12) 42%, transparent 70%); transition: opacity .4s ease; }
.project-tile .tile-meta { position: absolute; left: 20px; bottom: 18px; right: 20px; z-index: 2; }
.project-tile .tile-cat { display: inline-block; font-family: 'Manrope', sans-serif; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.78); margin-bottom: 4px; }
.project-tile .tile-title { font-family: 'Manrope', sans-serif; font-size: clamp(1.15rem, 1.6vw, 1.7rem); font-weight: 600; letter-spacing: -0.02em; line-height: 1.05; color: #fff; margin: 0; }
.project-tile .tile-cta { position: absolute; top: 18px; right: 18px; z-index: 3; display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 5px; font-family: 'Manrope', sans-serif; font-weight: 500; font-size: 14px; opacity: 0; transform: translateY(-6px); transition: opacity .3s ease, transform .3s ease, background-color .3s; pointer-events: none; }
.project-tile:hover .tile-cta, .project-tile:focus-visible .tile-cta { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .project-tile .tile-image, .project-tile .tile-cta { transition: none; }
  .project-tile:hover .tile-image, .project-tile:focus-visible .tile-image { transform: none; }
}
```

- [ ] **Step 5 : Vérifier** — `npx vitest run src/app/components/common/ProjetTile.test.tsx` → PASS ; `npx biome lint src/app/components/common/ProjetTile.tsx` → 0 nouvelle erreur bloquante.

- [ ] **Step 6 : Commit**
```bash
git add src/app/components/common/ProjetTile.tsx src/app/components/common/ProjetTile.css src/app/components/common/ProjetTile.test.tsx
git commit -m "feat(projets): ProjetTile (tuile image + morph conserve)"
```

---

### Task 5 : Page `Projets` — FilterBar + mosaïque + FLIP

**Files:**
- Modify: `src/app/pages/Projets.tsx`
- Create: `src/app/pages/Projets.css`
- Modify: `src/app/pages/Projets.test.tsx` (mock `ProjetTile` au lieu de `NewProjectCard` ; ajouter le test de filtre ; étendre le mock `motion/react` avec `AnimatePresence`)

**Interfaces:**
- Consumes: `getTousProjets` (Task 1), `FilterBar` (Task 3), `ProjetTile` (Task 4), `filterProjets`/`FilterValue` (Task 2).

- [ ] **Step 1 : Adapter le test** — dans `Projets.test.tsx` :
  - Remplacer le mock `../components/common/NewProjectCard` par `../components/common/ProjetTile` (même corps mock : un `<img>` avec `getBoundingClientRect` figé, `data-project-link`, `alt={title}`). Retirer le mock `ScrollFadeIn` s'il n'est plus utilisé (voir Step 3), ou le garder si conservé.
  - Étendre le mock `motion/react` : ajouter `AnimatePresence: ({ children }) => <>{children}</>` à l'objet retourné (à côté de `motion`).
  - Adapter les assertions de comptage : remplacer `getAllByTestId('scroll-fade')` par le comptage des images de tuiles `screen.getAllByRole('img')` (longueur `tousProjets.length`) — les tests de reverse-morph doivent rester verts (le reverse lit toujours `cardRefs[link]`).
  - **Ajouter** un test de filtre :
```tsx
it('filtre la mosaïque par discipline', () => {
  renderReturn();
  const mobileCount = tousProjets.filter((p) => p.category === 'mobile').length;
  fireEvent.click(screen.getByRole('tab', { name: 'Mobile' }));
  expect(screen.getAllByRole('img')).toHaveLength(mobileCount);
  fireEvent.click(screen.getByRole('tab', { name: 'Tous' }));
  expect(screen.getAllByRole('img')).toHaveLength(tousProjets.length);
});
```
  (le mock `AnimatePresence` rend les enfants synchrones → le comptage est immédiat.)

- [ ] **Step 2 : Vérifier l'échec** — `npx vitest run src/app/pages/Projets.test.tsx` → FAIL (ProjetTile/tab absents).

- [ ] **Step 3 : Réécrire `Projets.tsx`** — conserver **intégralement** les hooks de haut de fichier (scroll restore, `beginReverse`, `cardRefs`, préchargement — L29-99 actuels). Remplacer le rendu de la liste (L119-176) par : header + `<FilterBar>` + une grille `motion` filtrée. Ajout en tête :
```tsx
import './Projets.css';
import FilterBar from '../components/common/FilterBar';
import ProjetTile from '../components/common/ProjetTile';
import { filterProjets, type FilterValue } from '../utils/filterProjets';
import { AnimatePresence } from 'motion/react';
```
État + liste filtrée (dans le composant) :
```tsx
const [filter, setFilter] = useState<FilterValue>('all');
const visibles = filterProjets(tousProjets, filter);
```
Rendu (remplace le bloc `space-y-6`) :
```tsx
<FilterBar value={filter} onChange={setFilter} />
<motion.div layout className="projets-mosaic">
  <AnimatePresence mode="popLayout">
    {visibles.map((projet, index) => (
      <motion.div
        key={projet.link}
        layout
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: reduceReturnMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`mosaic-cell cell-${projet.tileSize}`}
      >
        <ProjetTile
          link={projet.link}
          title={projet.text}
          category={projet.category}
          image={projet.image}
          tileSize={projet.tileSize}
          priority={index < 2}
          ref={(imageElement) => { cardRefs.current[projet.link] = imageElement; }}
        />
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>
```
> `tousProjets` provient déjà de `getTousProjets(lang)` (variable existante). `ProjetTile` remplace `NewProjectCard` ; on ne passe plus `number`/`description`/`tags`.

- [ ] **Step 4 : CSS mosaïque** — `src/app/pages/Projets.css`
```css
.projets-mosaic { display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-flow: dense; gap: clamp(14px, 1.6vw, 26px); }
.mosaic-cell { position: relative; border-radius: 12px; }
.mosaic-cell.cell-l { grid-column: span 7; aspect-ratio: 16 / 11; }
.mosaic-cell.cell-m { grid-column: span 5; aspect-ratio: 4 / 3; }
.mosaic-cell.cell-s { grid-column: span 4; aspect-ratio: 1 / 1; }
@media (max-width: 1024px) {
  .projets-mosaic { grid-template-columns: repeat(6, 1fr); }
  .mosaic-cell.cell-l { grid-column: span 6; aspect-ratio: 16 / 10; }
  .mosaic-cell.cell-m { grid-column: span 3; }
  .mosaic-cell.cell-s { grid-column: span 3; }
}
@media (max-width: 640px) {
  .projets-mosaic { grid-template-columns: 1fr; }
  .mosaic-cell.cell-l, .mosaic-cell.cell-m, .mosaic-cell.cell-s { grid-column: span 1; aspect-ratio: 4 / 3; }
}
```
> Les `span` (7/5/4 sur 12) sont un point de calibrage : ajuster pour un pavage sans trou disgracieux après capture visuelle (Step 6). `grid-auto-flow: dense` comble les creux.

- [ ] **Step 5 : Vérifier les tests** — `npx vitest run src/app/pages/Projets.test.tsx` → PASS (filtre + reverse-morph) ; `npx tsc --noEmit` → 0 erreur.

- [ ] **Step 6 : Vérification visuelle** — `npm run build` puis capture Playwright de `/projets` (desktop light+dark, mobile, un filtre actif). Ajuster les `span`/`aspect-ratio` de `Projets.css` si le pavage a des trous. Confirmer : mosaïque asymétrique, titres lisibles, hover (lift+glow+zoom+bouton), **clic → morph** OK (aller), reflow fluide au changement de filtre.

- [ ] **Step 7 : Commit**
```bash
git add src/app/pages/Projets.tsx src/app/pages/Projets.css src/app/pages/Projets.test.tsx
git commit -m "feat(projets): page en mosaique filtrable (FLIP) + morph conserve"
```

---

### Task 6 : Nettoyage `NewProjectCard` + vérifs finales

**Files:**
- Delete: `src/app/components/common/NewProjectCard.tsx`, `src/app/components/common/NewProjectCard.test.tsx`
- Verify: recherche d'imports résiduels

- [ ] **Step 1 : Vérifier qu'il n'est plus importé** — `grep -rn "NewProjectCard" src/` ne doit remonter que les fichiers à supprimer. S'il subsiste un import ailleurs, le remplacer par `ProjetTile`.

- [ ] **Step 2 : Supprimer** — `git rm src/app/components/common/NewProjectCard.tsx src/app/components/common/NewProjectCard.test.tsx`

- [ ] **Step 3 : Suite complète**
```bash
npx tsc --noEmit
npx biome lint src/app/pages/Projets.tsx src/app/components/common/ProjetTile.tsx src/app/components/common/FilterBar.tsx
npx vitest run
npm run build
npm run budget
```
Attendu : tsc 0 erreur ; vitest **tout vert** (le total change : −tests NewProjectCard, +tests ProjetTile/FilterBar/filterProjets/categories, net ≥ 88) ; build OK ; budget respecté.

- [ ] **Step 4 : Captures finales** — Playwright `/projets` desktop (light+dark), mobile, et 1 filtre actif → relire.

- [ ] **Step 5 : Commit**
```bash
git add -A
git commit -m "chore(projets): retrait de NewProjectCard (remplace par ProjetTile)"
```

---

## Self-Review (rempli)
- **Couverture spec** : concept mosaïque (T5/CSS) · filtres 3 disciplines (T1 data, T2 util, T3 FilterBar, T5 câblage) · titre toujours visible (T4 scrim) · hovers conservés (T4 : BorderGlow shell + RollingText + zoom) · morph conservé aller/retour (T4 logique portée, T5 `cardRefs`) · tailles curées (T1) · responsive (T3/T4/T5 CSS) · reduced-motion (T4/T5) · bilingue (T3/T4 `useT`). ✔
- **Placeholders** : aucun TODO/TBD ; seul point de calibrage assumé = les `span` de grille (T5 Step 6), avec méthode de vérification. ✔
- **Cohérence des types** : `FilterValue`/`ProjetCategory` (T2) réutilisés en T3/T5 ; `ProjetTile` props (T4) = ce que T5 passe ; `category`/`tileSize` (T1) exposés par `getTousProjets` et consommés en T5. ✔
