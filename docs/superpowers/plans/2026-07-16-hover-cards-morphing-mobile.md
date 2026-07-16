# Hover Cards and Mobile Morphing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a theme-aware pointer-following border glow to project cards and a smooth, reversible shared-image transition between the projects list and project details on mobile.

**Architecture:** A local `BorderGlow` component owns pointer geometry and CSS custom properties while `NewProjectCard` remains the only interactive link. Project navigation uses a typed transition snapshot retained by `PageTransitionContext`; the global overlay consumes it for forward and reverse animations, while `Projets` restores the source scroll position and resolves the return card before paint.

**Tech Stack:** React 18, TypeScript, React Router 7, Motion 12, CSS custom properties, Vitest 4, Testing Library.

---

## File map

- Create `src/app/components/common/BorderGlow.tsx`, `.css` and `.test.tsx` for pointer geometry and rendering.
- Create `src/app/utils/projectTransition.ts` and `.test.ts` for shared rect and timing helpers.
- Modify `src/app/components/common/NewProjectCard.tsx` and its test for glow integration and mobile forward navigation.
- Modify `src/app/context/PageTransitionContext.tsx`; add its test for snapshot lifecycle.
- Modify `src/app/components/PageTransitionOverlay.tsx`; add its test for mobile rendering.
- Modify `src/app/components/ScrollToTop.tsx`; add its test for return-scroll decisions.
- Modify `src/app/pages/Projets.tsx`; add its test for reverse morphing.
- Modify `src/app/pages/ProjetDetail.tsx` to remove obsolete context fields.
- Modify `src/styles/theme.css` and `src/styles/portfolio.css` for theme tokens and card states.

### Task 1: Build the pointer-aware BorderGlow component

**Files:**
- Create: `src/app/components/common/BorderGlow.test.tsx`
- Create: `src/app/components/common/BorderGlow.tsx`
- Create: `src/app/components/common/BorderGlow.css`

- [ ] **Step 1: Write the failing geometry and DOM tests**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BorderGlow, { getCursorAngle, getEdgeProximity } from './BorderGlow';

describe('BorderGlow', () => {
  it('maps the pointer from the center to the nearest edge', () => {
    expect(getEdgeProximity(200, 100, 100, 50)).toBe(0);
    expect(getEdgeProximity(200, 100, 200, 50)).toBe(1);
    expect(getCursorAngle(200, 100, 200, 50)).toBe(90);
  });

  it('writes proximity and direction to CSS variables', () => {
    render(<BorderGlow data-testid="glow">content</BorderGlow>);
    const glow = screen.getByTestId('glow');
    vi.spyOn(glow, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 100,
      right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}),
    });
    fireEvent.pointerMove(glow, { clientX: 200, clientY: 50 });
    expect(glow.style.getPropertyValue('--edge-proximity')).toBe('100.000');
    expect(glow.style.getPropertyValue('--cursor-angle')).toBe('90.000deg');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --run src/app/components/common/BorderGlow.test.tsx`

Expected: FAIL because `./BorderGlow` does not exist.

- [ ] **Step 3: Implement the local React Bits adaptation**

```tsx
import {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import './BorderGlow.css';

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

interface BorderGlowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  edgeSensitivity?: number;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  coneSpread?: number;
  fillOpacity?: number;
  colors?: [string, string, string];
}

export function getEdgeProximity(width: number, height: number, x: number, y: number) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = Math.abs(x - cx) / cx;
  const dy = Math.abs(y - cy) / cy;
  return Math.min(Math.max(Math.max(dx, dy), 0), 1);
}

export function getCursorAngle(width: number, height: number, x: number, y: number) {
  const dx = x - width / 2;
  const dy = y - height / 2;
  if (dx === 0 && dy === 0) return 0;
  const degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return degrees < 0 ? degrees + 360 : degrees;
}

export default function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 6,
  backgroundColor = 'var(--portfolio-card-bg)',
  borderRadius = 12,
  glowRadius = 18,
  coneSpread = 12,
  fillOpacity = 0,
  colors = [
    'var(--portfolio-card-glow-strong)',
    'var(--portfolio-card-glow-medium)',
    'var(--portfolio-card-glow-faint)',
  ],
  onPointerMove,
  ...props
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const edge = getEdgeProximity(rect.width, rect.height, x, y);
    const angle = getCursorAngle(rect.width, rect.height, x, y);
    card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    onPointerMove?.(event);
  }, [onPointerMove]);
  const style: GlowStyle = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    '--glow-strong': colors[0],
    '--glow-medium': colors[1],
    '--glow-faint': colors[2],
  };
  return (
    <div
      {...props}
      ref={cardRef}
      className={`border-glow-card ${className}`.trim()}
      style={{ ...style, ...props.style }}
      onPointerMove={handlePointerMove}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
```

Create `BorderGlow.css`:

```css
.border-glow-card {
  --edge-proximity: 0;
  --cursor-angle: 45deg;
  --edge-sensitivity: 6;
  --color-sensitivity: calc(var(--edge-sensitivity) + 14);
  --border-radius: 12px;
  --glow-padding: 18px;
  --cone-spread: 12;
  position: relative;
  display: grid;
  isolation: isolate;
  border: 1px solid var(--portfolio-card-border);
  border-radius: var(--border-radius);
  background: var(--card-bg);
  transform: translate3d(0, 0, 0.01px);
}
.border-glow-card::before,
.border-glow-card > .edge-light {
  content: '';
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transition: opacity 250ms ease-out;
}
.border-glow-card::before {
  inset: -1px;
  z-index: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  background:
    linear-gradient(var(--card-bg) 0 100%) padding-box,
    conic-gradient(
      from var(--cursor-angle),
      var(--glow-strong),
      var(--glow-medium) calc(var(--cone-spread) * 1%),
      transparent calc((var(--cone-spread) + 15) * 1%),
      transparent calc((100 - var(--cone-spread) - 15) * 1%),
      var(--glow-medium) calc((100 - var(--cone-spread)) * 1%),
      var(--glow-strong)
    ) border-box;
  mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
}
.border-glow-card > .edge-light {
  inset: calc(var(--glow-padding) * -1);
  z-index: 0;
  border-radius: inherit;
  mask-image: conic-gradient(from var(--cursor-angle), black 2%, transparent 10%, transparent 90%, black 98%);
  -webkit-mask-image: conic-gradient(from var(--cursor-angle), black 2%, transparent 10%, transparent 90%, black 98%);
}
.border-glow-card > .edge-light::before {
  content: '';
  position: absolute;
  inset: var(--glow-padding);
  border-radius: inherit;
  box-shadow:
    inset 0 0 0 1px var(--glow-strong),
    inset 0 0 8px var(--glow-medium),
    0 0 8px var(--glow-medium),
    0 0 18px var(--glow-faint);
}
.border-glow-inner {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
}
@media (hover: hover) and (pointer: fine) {
  .border-glow-card:hover::before {
    opacity: clamp(0, calc((var(--edge-proximity) - var(--color-sensitivity)) / (100 - var(--color-sensitivity))), 1);
  }
  .border-glow-card:hover > .edge-light {
    opacity: clamp(0, calc((var(--edge-proximity) - var(--edge-sensitivity)) / (100 - var(--edge-sensitivity))), 1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .border-glow-card::before,
  .border-glow-card > .edge-light { transition-duration: 0.01ms; }
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- --run src/app/components/common/BorderGlow.test.tsx`

Expected: 2 tests pass.

- [ ] **Step 5: Commit the component**

```powershell
git add src/app/components/common/BorderGlow.tsx src/app/components/common/BorderGlow.css src/app/components/common/BorderGlow.test.tsx
git commit -m "feat: add pointer-aware border glow"
```

### Task 2: Integrate BorderGlow without changing card semantics

**Files:**
- Modify: `src/app/components/common/NewProjectCard.tsx`
- Modify: `src/app/components/common/NewProjectCard.test.tsx`
- Modify: `src/styles/theme.css`
- Modify: `src/styles/portfolio.css`

- [ ] **Step 1: Add a failing integration assertion**

```tsx
it('wraps the single card link in decorative glow only', () => {
  const { container } = renderCard();
  const glow = container.querySelector('.border-glow-card');
  const link = screen.getByRole('link', { name: 'Voir le projet Projet test' });
  expect(glow).toContainElement(link);
  expect(within(glow as HTMLElement).getAllByRole('link')).toHaveLength(1);
  expect(glow).not.toHaveAttribute('role');
});
```

- [ ] **Step 2: Run the card test and verify RED**

Run: `npm test -- --run src/app/components/common/NewProjectCard.test.tsx`

Expected: FAIL because `.border-glow-card` is absent.

- [ ] **Step 3: Wrap the existing Link and add theme tokens**

Import `BorderGlow` from `./BorderGlow`. Wrap the current Link with `<BorderGlow className="project-card-shell">` and `</BorderGlow>`. Keep all navigation, pointer and focus handlers on the Link. Add `w-full` to the Link class and remove its inline `backgroundColor` and `border`; the wrapper owns those visual properties.

Replace the light-theme glow variables with:

```css
--portfolio-card-glow-strong: rgb(26 26 26 / 70%);
--portfolio-card-glow-medium: rgb(26 26 26 / 35%);
--portfolio-card-glow-faint: rgb(26 26 26 / 12%);
```

Replace the dark-theme variables with:

```css
--portfolio-card-glow-strong: rgb(234 234 234 / 90%);
--portfolio-card-glow-medium: rgb(234 234 234 / 45%);
--portfolio-card-glow-faint: rgb(234 234 234 / 16%);
```

Delete the fixed `.project-card::before` and `.project-card::after` rules. Keep image zoom, focus and reduced-motion rules, and add:

```css
.project-card-shell { overflow: visible; }
.project-card { min-width: 0; color: inherit; text-decoration: none; }
```

- [ ] **Step 4: Run card and glow tests and verify GREEN**

Run: `npm test -- --run src/app/components/common/BorderGlow.test.tsx src/app/components/common/NewProjectCard.test.tsx`

Expected: all tests pass, including the unique link and hover/focus RollingText tests.

- [ ] **Step 5: Commit the integration**

```powershell
git add src/app/components/common/NewProjectCard.tsx src/app/components/common/NewProjectCard.test.tsx src/styles/theme.css src/styles/portfolio.css
git commit -m "feat: add theme-aware project card glow"
```

### Task 3: Introduce a typed transition snapshot lifecycle

**Files:**
- Create: `src/app/utils/projectTransition.test.ts`
- Create: `src/app/utils/projectTransition.ts`
- Create: `src/app/context/PageTransitionContext.test.tsx`
- Modify: `src/app/context/PageTransitionContext.tsx`

- [ ] **Step 1: Write failing helper tests**

```ts
import { describe, expect, it } from 'vitest';
import { getProjectTransitionTiming, roundTransitionRect } from './projectTransition';

describe('project transition helpers', () => {
  it('uses mobile forward timing', () => {
    expect(getProjectTransitionTiming(390, 'forward')).toEqual({
      navigateDelay: 420, morphDuration: 0.65, overlayDuration: 800, reverseDelay: 0,
    });
  });
  it('preserves desktop forward timing', () => {
    expect(getProjectTransitionTiming(1440, 'forward')).toEqual({
      navigateDelay: 1000, morphDuration: 0.8, overlayDuration: 2000, reverseDelay: 0,
    });
  });
  it('uses exact reverse timings per breakpoint', () => {
    expect(getProjectTransitionTiming(390, 'reverse')).toEqual({
      navigateDelay: 0, morphDuration: 0.6, overlayDuration: 650, reverseDelay: 0,
    });
    expect(getProjectTransitionTiming(1440, 'reverse')).toEqual({
      navigateDelay: 0, morphDuration: 0.8, overlayDuration: 1000, reverseDelay: 0.3,
    });
  });
  it('rounds DOM geometry', () => {
    const rect = { left: 1.4, top: 2.6, width: 99.5, height: 49.4 } as DOMRect;
    expect(roundTransitionRect(rect)).toEqual({ left: 1, top: 3, width: 100, height: 49 });
  });
});
```

Create the context lifecycle test with this consumer:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageTransitionProvider, usePageTransition } from './PageTransitionContext';

const snapshot = {
  imageSrc: '/test.webp',
  imageRect: { left: 10, top: 20, width: 300, height: 200 },
  projectLink: '/projets/test',
  originPath: '/projets',
  scrollTop: 480,
};

function Harness() {
  const transition = usePageTransition();
  const state = [
    transition.isTransitioning ? 'active' : 'idle',
    transition.direction ?? 'none',
    transition.snapshot?.projectLink ?? 'none',
  ].join(':');
  return (
    <>
      <output data-testid="state">{state}</output>
      <button onClick={() => transition.beginForward(snapshot)}>forward</button>
      <button onClick={() => transition.completeTransition()}>complete</button>
      <button onClick={() => transition.beginReverse({ left: 20, top: 30, width: 320, height: 220 })}>reverse</button>
    </>
  );
}

describe('PageTransitionContext', () => {
  it('retains a list snapshot after forward and clears it after reverse', () => {
    render(<PageTransitionProvider><Harness /></PageTransitionProvider>);
    expect(screen.getByTestId('state')).toHaveTextContent('idle:none:none');
    fireEvent.click(screen.getByRole('button', { name: 'forward' }));
    expect(screen.getByTestId('state')).toHaveTextContent('active:forward:/projets/test');
    fireEvent.click(screen.getByRole('button', { name: 'complete' }));
    expect(screen.getByTestId('state')).toHaveTextContent('idle:forward:/projets/test');
    fireEvent.click(screen.getByRole('button', { name: 'reverse' }));
    expect(screen.getByTestId('state')).toHaveTextContent('active:reverse:/projets/test');
    fireEvent.click(screen.getByRole('button', { name: 'complete' }));
    expect(screen.getByTestId('state')).toHaveTextContent('idle:reverse:none');
  });
});
```

- [ ] **Step 2: Run helper and context tests and verify RED**

Run: `npm test -- --run src/app/utils/projectTransition.test.ts src/app/context/PageTransitionContext.test.tsx`

Expected: FAIL because the helper module and snapshot API do not exist.

- [ ] **Step 3: Implement timing and geometry helpers**

```ts
export type ProjectTransitionDirection = 'forward' | 'reverse';
export interface ProjectTransitionRect { left: number; top: number; width: number; height: number; }
export interface ProjectTransitionSnapshot {
  imageSrc: string;
  imageRect: ProjectTransitionRect;
  projectLink: string;
  originPath: string;
  scrollTop: number;
}
export function roundTransitionRect(rect: DOMRect): ProjectTransitionRect {
  return {
    left: Math.round(rect.left), top: Math.round(rect.top),
    width: Math.round(rect.width), height: Math.round(rect.height),
  };
}
export function getProjectTransitionTiming(width: number, direction: ProjectTransitionDirection) {
  if (width < 1024) {
    return direction === 'forward'
      ? { navigateDelay: 420, morphDuration: 0.65, overlayDuration: 800, reverseDelay: 0 }
      : { navigateDelay: 0, morphDuration: 0.6, overlayDuration: 650, reverseDelay: 0 };
  }
  return direction === 'forward'
    ? { navigateDelay: 1000, morphDuration: 0.8, overlayDuration: 2000, reverseDelay: 0 }
    : { navigateDelay: 0, morphDuration: 0.8, overlayDuration: 1000, reverseDelay: 0.3 };
}
export const prefersReducedProjectMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

- [ ] **Step 4: Refactor the context to the snapshot API**

Expose exactly:

```ts
interface PageTransitionContextType {
  isTransitioning: boolean;
  direction: ProjectTransitionDirection | null;
  snapshot: ProjectTransitionSnapshot | null;
  beginForward: (snapshot: ProjectTransitionSnapshot) => void;
  beginReverse: (targetRect: ProjectTransitionRect) => void;
  completeTransition: () => void;
  clearTransition: () => void;
}
```

Initialize `direction` to `null`. Implement methods with `useCallback`. `beginForward` stores the snapshot and activates `forward`. `beginReverse` replaces only `imageRect` and activates `reverse`. `completeTransition` retains a forward snapshot only when `originPath === '/projets'`; it clears every reverse snapshot. `clearTransition` returns to an inactive null snapshot and null direction.

- [ ] **Step 5: Run helper and context tests and verify GREEN**

Run: `npm test -- --run src/app/utils/projectTransition.test.ts src/app/context/PageTransitionContext.test.tsx`

Expected: timing, geometry and complete snapshot lifecycle pass.

- [ ] **Step 6: Commit the transition model**

```powershell
git add src/app/utils/projectTransition.ts src/app/utils/projectTransition.test.ts src/app/context/PageTransitionContext.tsx src/app/context/PageTransitionContext.test.tsx
git commit -m "refactor: model project image transitions"
```

### Task 4: Enable the forward shared-image transition on mobile

**Files:**
- Modify: `src/app/components/common/NewProjectCard.test.tsx`
- Modify: `src/app/components/common/NewProjectCard.tsx`
- Create: `src/app/components/PageTransitionOverlay.test.tsx`
- Modify: `src/app/components/PageTransitionOverlay.tsx`
- Modify: `src/app/pages/ProjetDetail.tsx`

- [ ] **Step 1: Write failing mobile and reduced-motion navigation tests**

Add a context probe to `renderCard`, enable fake timers, and assert the mobile timeline:

```tsx
vi.useFakeTimers();
Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
window.matchMedia = vi.fn().mockReturnValue({ matches: false });
renderCard();
fireEvent.click(screen.getByRole('link', { name: 'Voir le projet Projet test' }));
expect(screen.getByTestId('location')).toHaveTextContent('/');
expect(screen.getByTestId('transition-state')).toHaveTextContent('active:forward');
vi.advanceTimersByTime(419);
expect(screen.getByTestId('location')).toHaveTextContent('/');
vi.advanceTimersByTime(1);
expect(screen.getByTestId('location')).toHaveTextContent('/projets/test');
vi.useRealTimers();
```

Add a second test with `matchMedia().matches === true`. It must assert immediate `/projets/test` navigation and `idle:none` transition state.

Create `PageTransitionOverlay.test.tsx`. Seed a forward snapshot through a context consumer at `innerWidth = 390`, render the overlay, and assert `screen.getByAltText('')` uses `/test.webp`. This specifically guards removal of the desktop-only condition.

- [ ] **Step 2: Run card and overlay tests and verify RED**

Run: `npm test -- --run src/app/components/common/NewProjectCard.test.tsx src/app/components/PageTransitionOverlay.test.tsx`

Expected: FAIL because mobile navigation remains immediate and the overlay is hidden below 1024px.

- [ ] **Step 3: Start forward transitions at every viewport width**

In `NewProjectCard.tsx`, import `useLocation`, `getProjectTransitionTiming`, `prefersReducedProjectMotion` and `roundTransitionRect`. Replace the desktop-width branch with:

```tsx
if (
  !shouldKeepNativeNavigation &&
  image &&
  imageContainerRef.current &&
  !prefersReducedProjectMotion()
) {
  event.preventDefault();
  const timing = getProjectTransitionTiming(window.innerWidth, 'forward');
  beginForward({
    imageSrc: image,
    imageRect: roundTransitionRect(imageContainerRef.current.getBoundingClientRect()),
    projectLink: link,
    originPath: location.pathname,
    scrollTop: document.body.scrollTop,
  });
  window.setTimeout(() => navigate(link), timing.navigateDelay);
}
```

Do not prevent the event when reduced motion is active; the React Router Link then navigates immediately. Preserve the existing modifier-click guard exactly.

- [ ] **Step 4: Refactor the overlay around snapshot and responsive timings**

Remove `isDesktop` and `showOverlay`. Read `isTransitioning`, `snapshot`, `direction` and `completeTransition` from context. Return `null` when inactive, without a snapshot or without a direction. Use:

```tsx
const timing = getProjectTransitionTiming(window.innerWidth, direction);
const viewport = { width: window.innerWidth, height: window.innerHeight };
const cardRect = snapshot.imageRect;
const fullViewport = {
  left: 0,
  top: 0,
  width: viewport.width,
  height: viewport.height,
  borderRadius: '0px',
};
const cardViewport = { ...cardRect, borderRadius: '8px' };
```

For `forward`, animate `cardViewport → fullViewport`; for `reverse`, animate `fullViewport → cardViewport`. Use `timing.morphDuration`, `timing.reverseDelay` and the existing `[0.76, 0, 0.24, 1]` easing. Forward opacity is `[1, 1, 0]` with times `[0, 0.75, 1]`; reverse opacity stays `1`. Complete after `timing.overlayDuration` milliseconds.

Remove the now-unused transition context destructuring from `ProjetDetail.tsx`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- --run src/app/utils/projectTransition.test.ts src/app/context/PageTransitionContext.test.tsx src/app/components/common/NewProjectCard.test.tsx src/app/components/PageTransitionOverlay.test.tsx`

Expected: mobile waits 420ms, reduced motion is immediate, modifier clicks remain native, and the overlay renders at 390px.

- [ ] **Step 6: Commit the mobile forward morph**

```powershell
git add src/app/components/common/NewProjectCard.tsx src/app/components/common/NewProjectCard.test.tsx src/app/components/PageTransitionOverlay.tsx src/app/components/PageTransitionOverlay.test.tsx src/app/pages/ProjetDetail.tsx
git commit -m "feat: add mobile project image morphing"
```

### Task 5: Restore the list and animate the return path

**Files:**
- Create: `src/app/components/ScrollToTop.test.tsx`
- Modify: `src/app/components/ScrollToTop.tsx`
- Create: `src/app/pages/Projets.test.tsx`
- Modify: `src/app/pages/Projets.tsx`

- [ ] **Step 1: Write failing scroll-decision tests**

```tsx
expect(shouldRestoreProjectScroll('/projets', {
  originPath: '/projets', projectLink: '/projets/test',
})).toBe(true);
expect(shouldRestoreProjectScroll('/contact', {
  originPath: '/projets', projectLink: '/projets/test',
})).toBe(false);
expect(isTransitionRoute('/projets/test', {
  originPath: '/projets', projectLink: '/projets/test',
})).toBe(true);
expect(isTransitionRoute('/apropos', {
  originPath: '/projets', projectLink: '/projets/test',
})).toBe(false);
```

Create `Projets.test.tsx` with pass-through mocks for `PageHeader`, `ContactFooter`, `ScrollRevealTitle` and `ScrollFadeIn`. Mock `NewProjectCard` with `forwardRef` to an `<img>` and mock its rectangle to `{ left: 20, top: 160, width: 350, height: 250 }`. Seed and complete a forward snapshot containing `scrollTop: 480`, navigate to `/projets`, and assert:

```tsx
expect(document.body.scrollTop).toBe(480);
expect(screen.getByTestId('transition-state')).toHaveTextContent('active:reverse');
expect(screen.getByTestId('transition-rect')).toHaveTextContent('20,160,350,250');
```

- [ ] **Step 2: Run return-path tests and verify RED**

Run: `npm test -- --run src/app/components/ScrollToTop.test.tsx src/app/pages/Projets.test.tsx`

Expected: FAIL because route decisions and reverse-on-mount logic do not exist.

- [ ] **Step 3: Preserve scroll only for a matching return route**

Export from `ScrollToTop.tsx`:

```ts
type TransitionRoute = Pick<ProjectTransitionSnapshot, 'originPath' | 'projectLink'>;
export const shouldRestoreProjectScroll = (
  pathname: string,
  snapshot: TransitionRoute | null,
) => snapshot?.originPath === '/projets' && pathname === '/projets';
export const isTransitionRoute = (
  pathname: string,
  snapshot: TransitionRoute | null,
) => Boolean(snapshot && (
  pathname === snapshot.originPath || pathname === snapshot.projectLink
));
```

In the route-change effect, skip `document.body.scrollTop = 0` when `shouldRestoreProjectScroll` is true. If a transition is no longer active and `isTransitionRoute` is false, call `clearTransition()` to discard stale metadata.

- [ ] **Step 4: Replace the ineffective popstate listener with a layout effect**

In `Projets.tsx`, import `motion`, `useLocation`, `useLayoutEffect`, `prefersReducedProjectMotion` and `roundTransitionRect`. Remove the entire `popstate` effect and use:

```tsx
const location = useLocation();
const { snapshot, isTransitioning, beginReverse, clearTransition } = usePageTransition();
const isReturning = Boolean(
  !isTransitioning &&
  snapshot?.originPath === '/projets' &&
  location.pathname === '/projets',
);

useLayoutEffect(() => {
  if (!isReturning || !snapshot) return;
  document.body.scrollTop = snapshot.scrollTop;
  if (prefersReducedProjectMotion()) {
    clearTransition();
    return;
  }
  const image = cardRefs.current[snapshot.projectLink];
  if (!image) {
    clearTransition();
    return;
  }
  beginReverse(roundTransitionRect(image.getBoundingClientRect()));
}, [isReturning, snapshot, beginReverse, clearTransition]);
```

Change the root `<div>` into:

```tsx
<motion.div
  className="relative min-h-screen projets-page"
  style={{ backgroundColor: 'var(--portfolio-bg)' }}
  initial={isReturning ? { opacity: 0 } : false}
  animate={{ opacity: 1 }}
  transition={{ duration: isReturning ? 0.2 : 0 }}
>
```

Close it with `</motion.div>`. The 200ms page fade is visible only when no target overlay can cover the route swap.

- [ ] **Step 5: Run return-path tests and verify GREEN**

Run: `npm test -- --run src/app/components/ScrollToTop.test.tsx src/app/pages/Projets.test.tsx src/app/components/PageTransitionOverlay.test.tsx`

Expected: scroll restores to 480, the current image rect becomes the reverse target, and missing or reduced-motion targets clear safely.

- [ ] **Step 6: Commit reverse navigation**

```powershell
git add src/app/components/ScrollToTop.tsx src/app/components/ScrollToTop.test.tsx src/app/pages/Projets.tsx src/app/pages/Projets.test.tsx
git commit -m "feat: animate project return on mobile"
```

### Task 6: Full verification and delivery

**Files:**
- Verify all modified source, style and test files.

- [ ] **Step 1: Run the full automated suite**

Run: `npm test -- --run`

Expected: every Vitest file and test passes without unhandled errors.

- [ ] **Step 2: Build production assets**

Run: `npm run build`

Expected: Vite completes successfully. The existing chunk-size warning is acceptable; new build errors are not.

- [ ] **Step 3: Check dependencies and whitespace**

Run: `npm audit`

Expected: `found 0 vulnerabilities`.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 4: Verify interactions in a browser**

At `1440 × 900`, verify the glow near all four edges in both themes, then tab to the card and confirm a visible focus outline. At `390 × 844`, verify card-to-hero morphing, browser-back hero-to-card morphing, restoration of scroll, menu return, and immediate navigation with reduced motion enabled.

- [ ] **Step 5: Inspect and push the completed branch**

Run: `git status -sb`

Expected: a clean worktree after implementation commits.

Run: `git log --oneline origin/main..HEAD`

Expected: the design, plan and implementation commits are listed.

Run: `git push origin main`

Expected: `origin/main` advances to the verified implementation.
