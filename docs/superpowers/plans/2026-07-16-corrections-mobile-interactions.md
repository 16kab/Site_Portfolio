# Corrections mobile et interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger le plein écran iPhone, accélérer les révélations, rendre les cards entièrement interactives et étendre le hover du menu sans altérer l’identité ni les transitions du portfolio.

**Architecture:** Les corrections restent dans les composants existants. Les primitives globales de viewport ne changent que la route d’accueil grâce à une classe temporaire sur `body`; les animations de scroll deviennent configurables sans modifier leurs valeurs par défaut; la card devient un lien sémantique qui conserve la transition d’image desktop; le header étend son état de hover partagé à quatre cibles.

**Tech Stack:** React 18, TypeScript, React Router 7, Motion 12, GSAP 3, Tailwind CSS 4, Vite 6, Vitest, jsdom et Testing Library.

---

## État du dépôt à préserver

`package.json`, `package-lock.json` et `src/app/App.tsx` contiennent déjà des modifications utilisateur pour Vercel Analytics et Speed Insights. Chaque étape doit conserver ces lignes. Aucun commit d’implémentation ne sera créé automatiquement, car les dépendances de test et la correction de `App.tsx` chevauchent ces fichiers non commités. Les checkpoints utiliseront `git diff` et les commandes de validation sans incorporer implicitement le travail utilisateur à un commit.

Spécification de référence : `docs/superpowers/specs/2026-07-16-corrections-mobile-interactions-design.md`.

## Structure des changements

- `package.json`, `package-lock.json` : scripts et dépendances de test, en conservant les packages Vercel.
- `vite.config.ts` : environnement Vitest/jsdom commun avec Vite.
- `src/test/setup.ts` : matchers DOM, nettoyage Testing Library et polyfills DOM minimaux.
- `src/app/App.test.tsx`, `src/app/pages/Home.test.tsx`, `src/app/components/Shuffle.test.ts` : régressions accueil et glyphes.
- `index.html`, `src/app/App.tsx`, `src/app/pages/Home.tsx`, `src/app/components/Grainient.tsx`, `src/app/components/Shuffle.tsx`, `src/styles/theme.css` : viewport, hauteur, délai et masque de lettres.
- `src/app/components/ScrollFadeIn.test.tsx`, `src/app/components/ScrollFadeIn.tsx`, `src/app/pages/Projets.tsx` : déclenchement anticipé et mouvement réduit.
- `src/app/components/common/NewProjectCard.test.tsx`, `src/app/components/common/NewProjectCard.tsx`, `src/styles/portfolio.css`, `src/styles/theme.css` : lien racine, hover/focus, zoom et lumière partielle.
- `src/app/components/Header.test.tsx`, `src/app/components/Header.tsx` : quatre états d’atténuation du menu.

### Task 1: Installer et configurer Vitest + Testing Library

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.tsx`

- [ ] **Step 1: Installer les dépendances de développement autorisées**

Run:

```powershell
npm install --save-dev vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

Expected: code 0; les entrées Vercel existantes restent présentes dans `dependencies`; les nouveaux packages apparaissent dans `devDependencies` et dans le lockfile.

- [ ] **Step 2: Ajouter le script de test**

Dans `package.json`, conserver les trois scripts existants et ajouter :

```json
"scripts": {
  "build": "vite build",
  "dev": "vite",
  "preview": "vite preview",
  "test": "vitest"
}
```

- [ ] **Step 3: Configurer Vitest dans la configuration Vite existante**

Remplacer l’import de `defineConfig` et ajouter la propriété `test` sans modifier les plugins et alias existants :

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'three': path.resolve(__dirname, './node_modules/three'),
    },
    dedupe: ['three'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

- [ ] **Step 4: Créer le setup DOM partagé**

Créer `src/test/setup.ts` :

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  document.body.className = ''
  document.body.removeAttribute('style')
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
```

- [ ] **Step 5: Ajouter un smoke test de l’environnement**

Créer `src/test/smoke.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('test environment', () => {
  it('renders React into jsdom', () => {
    render(<button type="button">Tester</button>)
    expect(screen.getByRole('button', { name: 'Tester' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Vérifier l’infrastructure**

Run:

```powershell
npm test -- --run src/test/smoke.test.tsx
```

Expected: `1 passed`, code 0, aucune erreur jsdom.

- [ ] **Step 7: Checkpoint du diff sans commit**

Run:

```powershell
git diff --check
git diff -- package.json package-lock.json vite.config.ts src/test/setup.ts src/test/smoke.test.tsx
```

Expected: aucune erreur d’espaces; Analytics et Speed Insights sont toujours présents.

### Task 2: Corriger le viewport iPhone, le retour du titre et le masque des glyphes

**Files:**
- Create: `src/app/App.test.tsx`
- Create: `src/app/pages/Home.test.tsx`
- Create: `src/app/components/Shuffle.test.ts`
- Modify: `index.html:5`
- Modify: `src/app/App.tsx:20-38,43-75`
- Modify: `src/app/pages/Home.tsx:1-21,169-197`
- Modify: `src/app/components/Shuffle.tsx:96-110`
- Modify: `src/app/components/Grainient.tsx:220-228`
- Modify: `src/app/components/Header.tsx:112-115`
- Modify: `src/styles/theme.css:131-185`

- [ ] **Step 1: Écrire les tests rouges de la configuration du hero et du verrouillage de scroll**

Créer `src/app/pages/Home.test.tsx` :

```tsx
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import Home, { HOME_BODY_CLASS, getHomeAnimationDelays } from './Home'

vi.mock('../components/Shuffle', () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}))

describe('Home', () => {
  it('uses a short reveal delay after the splash has completed', () => {
    expect(getHomeAnimationDelays(false)).toEqual({
      textDelay: 0.1,
      shuffleDelay1: 0,
      shuffleDelay2: 0.1,
    })
  })

  it('locks body scrolling only while the home page is mounted', () => {
    const view = render(
      <MemoryRouter>
        <Home showSplash={false} />
      </MemoryRouter>,
    )

    expect(document.body).toHaveClass(HOME_BODY_CLASS)
    view.unmount()
    expect(document.body).not.toHaveClass(HOME_BODY_CLASS)
  })
})
```

- [ ] **Step 2: Écrire le test rouge qui exige l’état courant du splash dans `AppContent`**

Créer `src/app/App.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AppContent } from './App'

vi.mock('./pages/Home', () => ({
  default: ({ showSplash }: { showSplash: boolean }) => (
    <div data-testid="home-splash-state">{String(showSplash)}</div>
  ),
}))

describe('AppContent', () => {
  it('passes the live splash state to Home', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppContent showSplash={false} />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('home-splash-state')).toHaveTextContent('false')
  })
})
```

- [ ] **Step 3: Écrire le test rouge du padding compensé des glyphes**

Créer `src/app/components/Shuffle.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { getCharacterMaskPadding } from './Shuffle'

describe('getCharacterMaskPadding', () => {
  it('scales with large glyphs while staying bounded', () => {
    expect(getCharacterMaskPadding(25)).toBe(4)
    expect(getCharacterMaskPadding(150)).toBe(6)
    expect(getCharacterMaskPadding(400)).toBe(12)
  })
})
```

- [ ] **Step 4: Exécuter les tests et confirmer l’échec attendu**

Run:

```powershell
npm test -- --run src/app/App.test.tsx src/app/pages/Home.test.tsx src/app/components/Shuffle.test.ts
```

Expected: FAIL parce que `AppContent`, `HOME_BODY_CLASS`, `getHomeAnimationDelays` et `getCharacterMaskPadding` ne sont pas encore exportés.

- [ ] **Step 5: Transmettre l’état réel du splash**

Dans `src/app/App.tsx`, supprimer l’état `hadSplash`, exporter `AppContent` et lui passer la valeur courante :

```tsx
export function AppContent({ showSplash }: { showSplash: boolean }) {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <Routes location={location}>
        <Route path="/" element={<Home showSplash={showSplash} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/apropos" element={<APropos />} />
        <Route path="/projets" element={<Projets />} />
        <Route path="/projets/:id" element={<ProjetDetail />} />
      </Routes>
    </>
  )
}
```

Dans `App`, remplacer l’usage par :

```tsx
<AppContent showSplash={showSplash} />
```

Conserver sans modification les imports et composants `Analytics` et `SpeedInsights`.

- [ ] **Step 6: Ajouter les délais courts et le verrou de route dans `Home`**

Ajouter `useEffect`, les exports et utiliser leur résultat :

```tsx
import { useEffect } from 'react'

export const HOME_BODY_CLASS = 'home-page-active'

export function getHomeAnimationDelays(showSplash: boolean) {
  return showSplash
    ? { textDelay: 2.4, shuffleDelay1: 0.2, shuffleDelay2: 2 }
    : { textDelay: 0.1, shuffleDelay1: 0, shuffleDelay2: 0.1 }
}

export default function Home({ showSplash }: HomeProps) {
  const { textDelay, shuffleDelay1, shuffleDelay2 } = getHomeAnimationDelays(showSplash)

  useEffect(() => {
    document.body.classList.add(HOME_BODY_CLASS)
    document.body.scrollTop = 0

    return () => document.body.classList.remove(HOME_BODY_CLASS)
  }, [])
```

Remplacer `h-screen` sur le conteneur du hero par `h-full`. Pour le CTA mobile, remplacer le `bottom` par :

```tsx
bottom: 'max(5rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))',
```

- [ ] **Step 7: Étendre le viewport et appliquer les hauteurs dynamiques scoped**

Dans `index.html`, utiliser :

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Dans `src/styles/theme.css`, conserver les règles existantes et remplacer/compléter les blocs concernés :

```css
  .app-container {
    min-height: 100vh;
    min-height: 100dvh;
    background-color: transparent;
  }

  body.home-page-active {
    height: 100vh;
    height: 100dvh;
    overflow-y: hidden;
  }

  body.home-page-active .app-container {
    height: 100vh;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
  }

  .grainient-wrapper {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    z-index: 0;
    pointer-events: none;
  }

  .home-section {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    min-height: 0;
    position: relative;
    z-index: 1;
  }

  .animated-bg-canvas {
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
  }
```

- [ ] **Step 8: Garder le header dans la safe area**

Dans `src/app/components/Header.tsx`, remplacer le style du `motion.header` par :

```tsx
style={{
  top: 0,
  paddingTop: 'max(2rem, calc(env(safe-area-inset-top, 0px) + 1rem))',
}}
```

- [ ] **Step 9: Dimensionner `Grainient` depuis son conteneur**

Dans `src/app/components/Grainient.tsx`, remplacer `setSize` par :

```ts
const setSize = () => {
  const bounds = container.getBoundingClientRect()
  const width = Math.max(1, Math.floor(bounds.width))
  const height = Math.max(1, Math.floor(bounds.height))
  renderer!.setSize(width, height)
  const res = program.uniforms.iResolution.value as Float32Array
  res[0] = gl.drawingBufferWidth
  res[1] = gl.drawingBufferHeight
}
```

- [ ] **Step 10: Élargir les masques sans modifier l’avance typographique**

Dans `src/app/components/Shuffle.tsx`, ajouter :

```ts
export const getCharacterMaskPadding = (width: number) =>
  Math.min(12, Math.max(4, width * 0.04))
```

Puis remplacer les styles de wrapper par :

```ts
const maskPadding = getCharacterMaskPadding(w)

wrapper.style.display = 'inline-block'
wrapper.style.overflow = 'hidden'
wrapper.style.verticalAlign = 'top'
wrapper.style.boxSizing = 'content-box'
wrapper.style.marginLeft = `-${maskPadding}px`
wrapper.style.marginRight = `-${maskPadding}px`
wrapper.style.padding = `0 ${maskPadding}px`
wrapper.style.width = `${w + 4}px`
wrapper.style.height = `${h}px`
```

La largeur ajoutée par le padding est exactement annulée par les marges négatives; ne modifier ni `spacingMultiplier` ni les offsets GSAP.

- [ ] **Step 11: Exécuter les tests ciblés puis le build**

Run:

```powershell
npm test -- --run src/app/App.test.tsx src/app/pages/Home.test.tsx src/app/components/Shuffle.test.ts
npm run build
```

Expected: tous les tests PASS; build Vite code 0; aucune suppression des composants Vercel.

### Task 3: Déclencher plus tôt les cards et respecter le mouvement réduit

**Files:**
- Create: `src/app/components/ScrollFadeIn.test.tsx`
- Modify: `src/app/components/ScrollFadeIn.tsx:3-38`
- Modify: `src/app/pages/Projets.tsx:84-97`

- [ ] **Step 1: Écrire les tests rouges des options d’observation**

Créer `src/app/components/ScrollFadeIn.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const motionMocks = vi.hoisted(() => ({
  useInView: vi.fn(() => false),
  useReducedMotion: vi.fn(() => false),
}))

vi.mock('motion/react', async () => {
  const { forwardRef } = await import('react')
  return {
    useInView: motionMocks.useInView,
    useReducedMotion: motionMocks.useReducedMotion,
    motion: {
      div: forwardRef<HTMLDivElement, PropsWithChildren<{
        initial: unknown
        animate: unknown
      }>>(({ children, initial, animate }, ref) => (
        <div
          ref={ref}
          data-testid="motion-wrapper"
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(animate)}
        >
          {children}
        </div>
      )),
    },
  }
})

import ScrollFadeIn from './ScrollFadeIn'

describe('ScrollFadeIn', () => {
  beforeEach(() => {
    motionMocks.useInView.mockReturnValue(false)
    motionMocks.useReducedMotion.mockReturnValue(false)
  })

  it('forwards an earlier threshold and root margin to useInView', () => {
    render(
      <ScrollFadeIn amount={0.15} margin="0px 0px 10% 0px">
        Card
      </ScrollFadeIn>,
    )

    expect(motionMocks.useInView).toHaveBeenCalledWith(expect.anything(), {
      once: true,
      amount: 0.15,
      margin: '0px 0px 10% 0px',
    })
  })

  it('renders the visible state immediately when motion is reduced', () => {
    motionMocks.useReducedMotion.mockReturnValue(true)
    render(<ScrollFadeIn>Card</ScrollFadeIn>)

    expect(screen.getByTestId('motion-wrapper')).toHaveAttribute('data-initial', 'false')
    expect(screen.getByTestId('motion-wrapper')).toHaveAttribute(
      'data-animate',
      JSON.stringify({ opacity: 1, y: 0, filter: 'blur(0px)' }),
    )
  })
})
```

- [ ] **Step 2: Exécuter le test et confirmer l’échec**

Run:

```powershell
npm test -- --run src/app/components/ScrollFadeIn.test.tsx
```

Expected: FAIL parce que `amount`, `margin` et `useReducedMotion` ne sont pas encore pris en charge.

- [ ] **Step 3: Implémenter les options sans changer les valeurs par défaut**

Dans `ScrollFadeIn.tsx`, utiliser :

```tsx
import { motion, useInView, useReducedMotion, type UseInViewOptions } from 'motion/react'
import { useRef } from 'react'

interface ScrollFadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  amount?: UseInViewOptions['amount']
  margin?: UseInViewOptions['margin']
}

const hiddenState = { opacity: 0, y: 50, filter: 'blur(10px)' }
const visibleState = { opacity: 1, y: 0, filter: 'blur(0px)' }

export default function ScrollFadeIn({
  children,
  className = '',
  delay = 0,
  amount = 0.3,
  margin = '0px',
}: ScrollFadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount, margin })
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : hiddenState}
      animate={shouldReduceMotion || isInView ? visibleState : hiddenState}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }
      }
      className={className}
      style={{ pointerEvents: 'auto', position: 'relative' }}
    >
      {children}
    </motion.div>
  )
}

export { ScrollFadeIn }
```

- [ ] **Step 4: Utiliser les paramètres anticipés seulement sur `/projets`**

Dans `src/app/pages/Projets.tsx`, remplacer le wrapper de chaque card par :

```tsx
<ScrollFadeIn
  key={projet.link}
  delay={Math.min(0.025 + index * 0.025, 0.1)}
  amount={0.15}
  margin="0px 0px 10% 0px"
>
  <NewProjectCard
    link={projet.link}
    number={projet.number}
    title={projet.text}
    description={projet.description}
    tags={projet.tags}
    image={projet.image}
    ref={(imageElement) => {
      cardRefs.current[projet.link] = imageElement
    }}
  />
</ScrollFadeIn>
```

- [ ] **Step 5: Vérifier le test et les usages existants**

Run:

```powershell
npm test -- --run src/app/components/ScrollFadeIn.test.tsx
npm run build
```

Expected: tests PASS; build code 0; les usages de `ScrollFadeIn` sans nouveaux props conservent `amount: 0.3` et `margin: 0px`.

### Task 4: Rendre toute la card interactive et ajouter les effets desktop

**Files:**
- Create: `src/app/components/common/NewProjectCard.test.tsx`
- Modify: `src/app/components/common/NewProjectCard.tsx:1-197`
- Modify: `src/styles/theme.css:8-29,68-89`
- Modify: `src/styles/portfolio.css:1-8`

- [ ] **Step 1: Écrire les tests rouges de sémantique et d’état interactif**

Créer `src/app/components/common/NewProjectCard.test.tsx` :

```tsx
import { createRef } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { PageTransitionProvider } from '../../context/PageTransitionContext'
import NewProjectCard from './NewProjectCard'

vi.mock('../RollingText', () => ({
  default: ({ text, inView }: { text: string; inView: boolean }) => (
    <span data-testid="rolling-text" data-active={String(inView)}>{text}</span>
  ),
}))

const renderCard = (ref = createRef<HTMLImageElement>()) => {
  const view = render(
    <MemoryRouter>
      <PageTransitionProvider>
        <NewProjectCard
          ref={ref}
          link="/projets/test"
          number="01"
          title="Projet test"
          description="Description test"
          tags={['UX', 'UI']}
          image="/test.webp"
        />
      </PageTransitionProvider>
    </MemoryRouter>,
  )
  return { ...view, ref }
}

describe('NewProjectCard', () => {
  it('uses one accessible link for the whole card without a nested button', () => {
    renderCard()
    const link = screen.getByRole('link', { name: 'Voir le projet Projet test' })

    expect(link).toHaveAttribute('href', '/projets/test')
    expect(within(link).queryByRole('button')).not.toBeInTheDocument()
  })

  it('activates the rolling label from the card hover and focus', () => {
    renderCard()
    const link = screen.getByRole('link', { name: 'Voir le projet Projet test' })
    const rolling = screen.getByTestId('rolling-text')

    expect(rolling).toHaveAttribute('data-active', 'false')
    fireEvent.mouseEnter(link)
    expect(rolling).toHaveAttribute('data-active', 'true')
    fireEvent.mouseLeave(link)
    fireEvent.focus(link)
    expect(rolling).toHaveAttribute('data-active', 'true')
    fireEvent.blur(link)
    expect(rolling).toHaveAttribute('data-active', 'false')
  })

  it('forwards its ref to the project image', () => {
    const { ref } = renderCard()
    expect(ref.current).toBe(screen.getByRole('img', { name: 'Projet test' }))
  })
})
```

- [ ] **Step 2: Exécuter les tests et confirmer l’échec**

Run:

```powershell
npm test -- --run src/app/components/common/NewProjectCard.test.tsx
```

Expected: FAIL parce que la racine n’est pas un lien, le hover reste sur le bouton et le `ref` n’est pas attaché.

- [ ] **Step 3: Déplacer l’état interactif et conserver la transition desktop**

Dans `NewProjectCard.tsx`, remplacer l’état et le gestionnaire par :

```tsx
const [isHovered, setIsHovered] = useState(false)
const [isFocused, setIsFocused] = useState(false)
const isInteractive = isHovered || isFocused

const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
  if (window.innerWidth < 1024 || !image || !imageContainerRef.current) {
    return
  }

  event.preventDefault()
  const rect = imageContainerRef.current.getBoundingClientRect()
  const roundedRect = {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    x: Math.round(rect.x),
    y: Math.round(rect.y),
  } as DOMRect

  setIsReverse(false)
  setTransitionImageSrc(image)
  setTransitionImageRect(roundedRect)
  setIsTransitioning(true)

  window.setTimeout(() => navigate(link), 1000)
}
```

- [ ] **Step 4: Remplacer la racine et le faux bouton par une structure sémantique**

Remplacer le `<div>` racine par :

```tsx
<Link
  to={link}
  aria-label={`Voir le projet ${title}`}
  onClick={handleClick}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  className="project-card group relative flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 rounded-[12px] transition-colors duration-300 cursor-pointer"
  style={{
    backgroundColor: 'var(--portfolio-card-bg)',
    border: '1px solid var(--portfolio-card-border)',
  }}
>
```

Remplacer le `<button>` CTA et ses handlers par :

```tsx
<span
  className="inline-flex items-center gap-2 px-6 py-3 transition-colors duration-300 self-start"
  style={{
    backgroundColor: isInteractive
      ? 'var(--portfolio-button-bg-hover)'
      : 'var(--portfolio-button-bg)',
    color: 'var(--portfolio-button-text)',
    fontFamily: 'Manrope, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
    borderRadius: '5px',
  }}
>
  <svg className="w-4 h-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16" aria-hidden="true">
    <path d={svgPaths.p2fe73000} fill="currentColor" />
  </svg>
  <RollingText
    text="Voir le projet"
    inView={isInteractive}
    transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }}
  />
</span>
```

Fermer la racine avec `</Link>`. Sur l’image, utiliser :

```tsx
<img
  ref={ref}
  src={image}
  alt={title}
  className="project-card-image w-full h-full object-cover object-center"
/>
```

- [ ] **Step 5: Ajouter les tokens de lumière et de focus**

Dans `:root` de `theme.css`, ajouter :

```css
--portfolio-card-glow: rgba(255, 255, 255, 0.98);
--portfolio-card-glow-shadow: rgba(255, 255, 255, 0.55);
--portfolio-card-focus: #1A1A1A;
```

Dans `.dark`, ajouter :

```css
--portfolio-card-glow: rgba(234, 234, 234, 0.9);
--portfolio-card-glow-shadow: rgba(234, 234, 234, 0.32);
--portfolio-card-focus: #EAEAEA;
```

- [ ] **Step 6: Ajouter les effets strictement scoped dans `portfolio.css`**

Conserver les règles existantes et ajouter :

```css
.project-card {
  isolation: isolate;
  color: inherit;
  text-decoration: none;
}

.project-card::before,
.project-card::after {
  content: '';
  position: absolute;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 260ms ease;
}

.project-card::before {
  top: -1px;
  left: -1px;
  width: 42%;
  height: 34%;
  border-top: 1px solid var(--portfolio-card-glow);
  border-left: 1px solid var(--portfolio-card-glow);
  border-radius: 12px 0 0 0;
  filter: drop-shadow(-2px -2px 7px var(--portfolio-card-glow-shadow));
}

.project-card::after {
  right: -1px;
  bottom: -1px;
  width: 34%;
  height: 40%;
  border-right: 1px solid var(--portfolio-card-glow);
  border-bottom: 1px solid var(--portfolio-card-glow);
  border-radius: 0 0 12px 0;
  filter: drop-shadow(2px 2px 7px var(--portfolio-card-glow-shadow));
}

.project-card-image {
  transform: scale(1);
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.project-card:focus-visible {
  outline: 2px solid var(--portfolio-card-focus);
  outline-offset: 4px;
}

.project-card:focus-visible::before,
.project-card:focus-visible::after {
  opacity: 0.85;
}

.project-card:focus-visible .project-card-image {
  transform: scale(1.025);
}

@media (hover: hover) and (pointer: fine) {
  .project-card:hover::before,
  .project-card:hover::after {
    opacity: 0.85;
  }

  .project-card:hover .project-card-image {
    transform: scale(1.025);
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-card::before,
  .project-card::after,
  .project-card-image {
    transition-duration: 0.01ms;
  }

  .project-card:hover .project-card-image,
  .project-card:focus-visible .project-card-image {
    transform: none;
  }
}
```

- [ ] **Step 7: Vérifier les tests, le build et l’absence d’interaction imbriquée**

Run:

```powershell
npm test -- --run src/app/components/common/NewProjectCard.test.tsx
npm run build
rg -n "<button|onClick=\{handleClick\}" src/app/components/common/NewProjectCard.tsx
```

Expected: tests PASS; build code 0; aucune balise `<button>` dans `NewProjectCard`; `handleClick` est attaché au `Link` racine.

### Task 5: Étendre l’atténuation du menu au contact et au thème

**Files:**
- Create: `src/app/components/Header.test.tsx`
- Modify: `src/app/components/Header.tsx:9-40,136-238`

- [ ] **Step 1: Écrire le test rouge des quatre cibles**

Créer `src/app/components/Header.test.tsx` :

```tsx
import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import Header from './Header'

vi.mock('./Magnet', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./AnimatedThemeToggler', () => ({
  AnimatedThemeToggler: () => <button type="button">Changer de thème</button>,
}))

vi.mock('./RollingText', () => ({
  RollingText: ({ text }: { text: string }) => <span>{text}</span>,
}))

describe('Header menu attenuation', () => {
  it.each(['projets', 'apropos', 'contact', 'theme'] as const)(
    'keeps %s fully visible and dims the other targets',
    (activeItem) => {
      const { container } = render(
        <MemoryRouter>
          <Header showSplash={false} />
        </MemoryRouter>,
      )

      const active = container.querySelector<HTMLElement>(`[data-menu-item="${activeItem}"]`)
      expect(active).not.toBeNull()
      fireEvent.mouseEnter(active!)

      for (const item of ['projets', 'apropos', 'contact', 'theme']) {
        const element = container.querySelector<HTMLElement>(`[data-menu-item="${item}"]`)
        expect(element).toHaveStyle({ opacity: item === activeItem ? '1' : '0.4' })
      }
    },
  )
})
```

- [ ] **Step 2: Exécuter le test et confirmer l’échec**

Run:

```powershell
npm test -- --run src/app/components/Header.test.tsx
```

Expected: FAIL parce que les quatre éléments n’exposent pas encore `data-menu-item` et que contact/thème partagent une opacité de groupe.

- [ ] **Step 3: Ajouter le type et le calcul d’opacité communs**

Au-dessus du composant dans `Header.tsx`, ajouter :

```tsx
export type HeaderMenuItem = 'projets' | 'apropos' | 'contact' | 'theme'

export const getMenuItemOpacity = (
  hoveredItem: HeaderMenuItem | null,
  item: HeaderMenuItem,
) => (hoveredItem && hoveredItem !== item ? 0.4 : 1)
```

Typer l’état et le handler :

```tsx
const [hoveredItem, setHoveredItem] = useState<HeaderMenuItem | null>(null)

const handleMouseEnter = (item: HeaderMenuItem) => {
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = null
  }
  setHoveredItem(item)
}
```

- [ ] **Step 4: Appliquer les handlers et opacités aux liens existants**

Sur les liens Projets et À propos, ajouter `data-menu-item`, les handlers de focus et déplacer l’opacité sur le lien :

```tsx
<Link
  to="/projets"
  data-menu-item="projets"
  className="cursor-pointer transition-opacity duration-300"
  style={{ opacity: getMenuItemOpacity(hoveredItem, 'projets') }}
  onMouseEnter={() => handleMouseEnter('projets')}
  onMouseLeave={handleMouseLeave}
  onFocus={() => handleMouseEnter('projets')}
  onBlur={handleMouseLeave}
>
```

Sur le lien À propos, utiliser explicitement :

```tsx
<Link
  to="/apropos"
  data-menu-item="apropos"
  className="cursor-pointer transition-opacity duration-300"
  style={{ opacity: getMenuItemOpacity(hoveredItem, 'apropos') }}
  onMouseEnter={() => handleMouseEnter('apropos')}
  onMouseLeave={handleMouseLeave}
  onFocus={() => handleMouseEnter('apropos')}
  onBlur={handleMouseLeave}
>
```

Retirer les styles d’opacité internes devenus redondants des deux `<motion.p>`.

- [ ] **Step 5: Séparer contact et thème sans casser leurs hovers internes**

Retirer l’opacité du conteneur partagé puis remplacer l’ensemble contact + thème par :

```tsx
<div className="flex items-center gap-4">
  <motion.div
    data-menu-item="contact"
    className="transition-opacity duration-300"
    style={{ opacity: getMenuItemOpacity(hoveredItem, 'contact') }}
    onMouseEnter={() => handleMouseEnter('contact')}
    onMouseLeave={handleMouseLeave}
    onFocus={() => handleMouseEnter('contact')}
    onBlur={handleMouseLeave}
  >
    <motion.button
      onClick={scrollToContact}
      className="flex px-6 py-3 rounded-[5px] items-center gap-2 cursor-pointer transition-all duration-300"
      animate={{
        backgroundColor: isScrolled ? 'var(--header-button-bg-scrolled)' : 'var(--header-button-bg-default)',
        color: isScrolled ? 'var(--header-button-text-scrolled)' : 'var(--header-button-text-default)',
      }}
      onMouseEnter={() => setIsButtonHovered(true)}
      onMouseLeave={() => setIsButtonHovered(false)}
    >
      <MessageCircle size={18} />
      <motion.div
        className="font-['Manrope',sans-serif] font-medium text-[14px] whitespace-nowrap"
        animate={{
          color: isScrolled
            ? 'var(--header-button-text-scrolled)'
            : 'var(--header-button-text-default)',
        }}
      >
        <RollingText
          text="Entrer en contact"
          inView={isButtonHovered}
          transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }}
        />
      </motion.div>
    </motion.button>
  </motion.div>

  <motion.div
    data-menu-item="theme"
    className="transition-opacity duration-300"
    style={{ opacity: getMenuItemOpacity(hoveredItem, 'theme') }}
    onMouseEnter={() => handleMouseEnter('theme')}
    onMouseLeave={handleMouseLeave}
    onFocus={() => handleMouseEnter('theme')}
    onBlur={handleMouseLeave}
  >
    <AnimatedThemeToggler isScrolled={isScrolled} />
  </motion.div>
</div>
```

Le toggle mobile reste inchangé, car l’atténuation demandée concerne le menu desktop.

- [ ] **Step 6: Vérifier le test et le retour fluide**

Run:

```powershell
npm test -- --run src/app/components/Header.test.tsx
npm run build
```

Expected: les quatre cas PASS; build code 0; le timeout de 150 ms est toujours présent dans `handleMouseLeave`.

### Task 6: Vérification complète mobile, desktop, thèmes et régressions

**Files:**
- Verify: tous les fichiers modifiés ci-dessus

- [ ] **Step 1: Exécuter toute la suite Vitest**

Run:

```powershell
npm test -- --run
```

Expected: toutes les suites PASS, zéro test en échec, code 0.

- [ ] **Step 2: Exécuter le build de production**

Run:

```powershell
npm run build
```

Expected: Vite termine avec code 0 et génère `dist` sans erreur de transformation TypeScript/JSX.

- [ ] **Step 3: Vérifier les erreurs de diff et les changements de périmètre**

Run:

```powershell
git diff --check
git status --short
git diff --stat
```

Expected: aucune erreur d’espaces; seuls les fichiers du plan et les trois fichiers utilisateur déjà modifiés apparaissent; aucun asset ou composant sans rapport n’est touché.

- [ ] **Step 4: Lancer le serveur de développement pour les contrôles navigateur**

Run:

```powershell
npm run dev -- --host 127.0.0.1 --port 4173
```

Expected: serveur disponible sur `http://127.0.0.1:4173`.

- [ ] **Step 5: Contrôler l’accueil à 390 × 844 et 768 × 1024**

Vérifier dans Chrome avec émulation mobile :

```text
document.body.scrollHeight === document.body.clientHeight
document.querySelector('.home-section').getBoundingClientRect().height === window.visualViewport.height
getComputedStyle(document.body).overflowY === 'hidden'
```

Expected: les trois assertions sont vraies; le fond touche le haut et le bas; le header et le CTA ne chevauchent pas les zones sûres; aucun scroll vertical ne déplace la page.

- [ ] **Step 6: Mesurer le retour vers l’accueil**

Depuis `/`, naviguer vers `/projets`, puis revenir avec le logo et échantillonner l’opacité du conteneur visible du hero.

Expected: l’opacité commence à dépasser 0 avant 200 ms et continue vers 1 avec le fondu flouté existant.

- [ ] **Step 7: Contrôler `/projets` aux quatre tailles**

Tailles : 390 × 844, 768 × 1024, 1024 × 768 et 1440 × 900.

Expected:

```text
- une card suivante démarre avant 30 % de visibilité ;
- le déplacement reste de 50 px et la durée de 0,8 s hors mouvement réduit ;
- le hover desktop ne change pas le rectangle de la card ;
- l’image atteint scale(1.025) et reste coupée par son conteneur ;
- seuls deux segments du contour s’illuminent ;
- le CTA RollingText réagit au hover de toute la card ;
- un clic sur une zone textuelle ouvre le projet ;
- Tab affiche le focus et Entrée active le lien.
```

- [ ] **Step 8: Contrôler le menu et les deux thèmes à 1440 × 900**

Expected: sur Projets, À propos, Entrer en contact puis le toggle, la cible active reste à opacité 1 et les trois autres passent à 0,4; le retour normal est fluide; les couleurs de lumière et de focus restent visibles en clair comme en sombre.

- [ ] **Step 9: Contrôler `prefers-reduced-motion`**

Activer l’émulation `reduce`.

Expected: `ScrollFadeIn` ne translate ni ne floute; l’image des cards ne zoome pas; le focus et les segments lumineux restent visibles; le splash conserve son fallback déjà existant.

- [ ] **Step 10: Arrêter le serveur et relire les exigences**

Reprendre les quatre sections de la spécification et associer chaque critère d’acceptation à un test ou à une observation fraîche. Ne déclarer le travail terminé qu’après cette correspondance et les sorties code 0 de Vitest et Vite.
