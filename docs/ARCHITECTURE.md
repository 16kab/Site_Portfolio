# Architecture

Portfolio d'Alexis Kabiche — SPA React 18 + Vite + TypeScript, déployée sur
Vercel (alexiskabiche.com). Ce document décrit la structure, les flux de
données non triviaux, les conventions et les décisions actées.

## Stack

- **Vite 6** (build/dev) · **React 18** · **TypeScript 7** (strict, vérifié au build)
- **react-router 7** — navigation multi-pages, lazy loading par route
- **Motion** — animations React (transitions, révélations au scroll)
- **GSAP + SplitText** — uniquement l'effet « Shuffle » du hero d'accueil
- **OGL** — uniquement le fond WebGL « Grainient » de l'accueil
- **EmailJS** — formulaire de contact (client, honeypot anti-spam)
- **Biome** — lint + formatage · **Vitest + Testing Library** — tests unitaires
- **Playwright** — E2E · **@fontsource** — polices auto-hébergées

## Structure des dossiers

```
src/
  main.tsx              Point d'entrée (StrictMode, montage React)
  app/
    App.tsx             Providers, routes, splash, fond, en-tête
    pages/              Une page par route (Home, Projets, ProjetDetail,
                        APropos, Contact, NotFound)
    components/         Composants UI ; common/ = réutilisables (carte projet,
                        border glow)
    context/            PageTransitionContext (machine à états des transitions)
    hooks/              useEmailForm, useIsDarkMode (+ index.ts barrel)
    utils/              Fonctions pures testées (projectTransition, scrollBodyTo)
    data/              projetsData.ts (contenu des projets + dérivés)
    config/            constants (EmailJS, contact, toaster), routes
  styles/              theme.css (variables + layout), portfolio.css, fonts.css
  imports/             SVG paths exportés depuis Figma (générés, non édités)
  assets/              Images .webp des projets
  test/                setup Vitest + tests transverses
e2e/                   Specs Playwright (parcours critiques)
scripts/               check-bundle-budget.mjs (garde-fou de poids)
```

Séparation données / UI / logique : le contenu vit dans `data/`, la logique
réutilisable dans `hooks/` et `utils/` (fonctions pures testées), l'UI dans
`pages/` et `components/`.

## Flux de données clés

### Conteneur de scroll = `<body>`, pas `window`

`html` est `position: fixed; overflow: hidden` (cf. `theme.css`) ; c'est
**`document.body`** qui défile. Toute lecture/écriture de scroll passe donc par
`document.body.scrollTop` et un écouteur `scroll` sur `document.body`
(`window.scrollY` vaut toujours 0). L'utilitaire [`scrollBodyTo`](../src/app/utils/scrollBodyTo.ts)
centralise le défilement animé, annulable et respectueux de `prefers-reduced-motion`.

### Transition de projet (liste ⇄ détail)

Le cœur animé du site. `PageTransitionProvider`
([context](../src/app/context/PageTransitionContext.tsx)) tient une machine à
états (`isTransitioning`, `direction`, `snapshot`). Au clic sur une carte,
`NewProjectCard` capture un instantané (image, rectangle, scroll), déclenche
`beginForward`, puis navigue après un délai ; `PageTransitionOverlay` morphe
l'image de la carte vers le plein écran. Le retour rejoue l'animation en sens
inverse et restaure le scroll. Les timings sont extraits dans la fonction pure
[`getProjectTransitionTiming`](../src/app/utils/projectTransition.ts) (testée).
`ScrollToTop` arbitre remise à zéro vs restauration du scroll selon le snapshot.

### Thème clair/sombre

1. `public/theme-init.js` (chargé avant le rendu) applique la classe `dark` sur
   `<html>` selon `localStorage` — évite le flash au chargement.
2. `AnimatedThemeToggler` **écrit** le thème (bascule, persistance, animation
   View Transition) — seule source d'écriture.
3. `useIsDarkMode` **lit** le thème (observe la classe de `<html>`) — utilisé par
   le fond, le splash et le Toaster.

### Formulaire de contact

`useEmailForm` isole validation, honeypot anti-spam et envoi EmailJS. Un
honeypot rempli simule un succès sans rien envoyer. Les coordonnées et l'ID
EmailJS vivent dans `config/constants.ts` (`SITE_CONTACT`, `EMAILJS_CONFIG`).

### SEO par route

`PageMeta` met à jour titre, description, canonical et Open Graph à chaque
changement de route (une seule page HTML servie).

## Conventions

- **Routes** : toutes via `ROUTES` (`config/routes.ts`), source unique.
- **Coordonnées** : toutes via `SITE_CONTACT`.
- **Accessibilité** : `prefers-reduced-motion` respecté partout ; focus géré dans
  les modales ; landmarks et ARIA sur menus/lightbox.
- **Tests** : comportement plutôt qu'implémentation ; unitaires sous `src/`
  (`*.test.tsx`), E2E sous `e2e/` (`*.spec.ts`).
- **Commits** : français, format conventionnel (`feat:`, `fix:`, `refactor:`,
  `test:`, `ci:`, `docs:`…), un changement logique par commit, jamais de refactor
  mêlé à un changement de comportement.

## Décisions actées

- **`theme-init.js` externe** (et non inline) : compatible avec la CSP stricte
  (`script-src 'self'`). Volontaire — ne pas réintégrer inline.
- **`assetsInlineLimit: 0`** (vite) : empêche l'inline base64 des sous-ensembles
  woff2 dans le CSS critique. Volontaire.
- **Biome plutôt qu'ESLint + Prettier** : `typescript-eslint` est incompatible
  avec TypeScript 7 (portage natif ; son parser lit l'API du compilateur, qui a
  changé). Biome a son propre parser et couvre lint + formatage.
- **GSAP conservé pour Shuffle** : SplitText n'a pas d'équivalent Motion simple ;
  remplacer l'effet risquerait l'animation signature. Dette assumée.
- **Toaster thème-aware** (`ThemedToaster`) : suit le thème actif.

## Budget de bundle

Vérifié en CI par [`scripts/check-bundle-budget.mjs`](../scripts/check-bundle-budget.mjs).

- **Chunk d'entrée : ~175 kB gzip** (plafond **190 kB**). Toute dérive fait
  échouer la CI.
- Pages secondaires lazy-loadées par route (Projets, Détail, À propos, Contact,
  404).
- Répartition indicative du poids : React + Motion + react-router (socle),
  **GSAP ≈ 34 kB gzip**, **OGL ≈ 13 kB gzip** (accueil uniquement mais chargés
  au démarrage, cf. dette ci-dessous).

## Dette technique connue (différée)

- **Purge des branches mortes de `Shuffle`** : seules les directions `'right'`
  sont utilisées ; `'left'/'up'/'down'` sont du code mort (~80 lignes). Le
  retrait est sûr côté runtime mais entrelacé avec le chemin vivant, sur
  l'animation signature de la home — à faire avec une **revue visuelle
  avant/après** (l'E2E tourne en mouvement réduit, où Shuffle ne s'anime pas).
- **Lazy-load de Grainient/Shuffle** (bundle) : sortirait ~47 kB gzip du
  démarrage pour les visiteurs arrivant en direct sur une sous-page, mais
  provoque un flash du hero lors d'une navigation SPA vers l'accueil (pas de
  splash pour le masquer). Abandonné tant que le flash n'est pas éliminable.

### Déjà traité (branche `refactor/dedup-differee`)

- **Scroll-spy dédupliqué** : la logique de menu sticky + détection de section
  de `ProjetDetail` et `APropos` est factorisée dans `useScrollSpy` +
  `resolveActiveSection` (fonction pure unit-testée).
- **Carrousels d'`APropos`** factorisés en `InfoCard` + `CardCarousel`.

## Commandes

```bash
npm run dev          # serveur de dev
npm run typecheck    # tsc --noEmit
npm run lint         # Biome (lint)
npm run format       # Biome (formatage, écrit)
npm test             # Vitest (watch)
npm run build        # typecheck + build de prod
npm run budget       # vérifie le poids du chunk d'entrée
npm run test:e2e     # Playwright (build + preview + parcours)
```

La CI GitHub Actions ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml))
rejoue typecheck, lint, format, tests, build, budget et E2E sur chaque PR et push
sur `main`.
