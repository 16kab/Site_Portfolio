# Portfolio — Alexis Kabiche

Site portfolio personnel de designer UX/UI. Application web statique
(SPA) construite avec **Vite + React + TypeScript + Tailwind CSS**.

🌐 En ligne : [alexiskabiche.com](https://alexiskabiche.com)

## Stack

- **Vite 6** — build & serveur de dev
- **React 18** + **TypeScript** (strict, vérifié au build)
- **Tailwind CSS 4**
- **React Router 7** — navigation multi-pages (lazy loading par route)
- **GSAP / Motion** — animations (avec respect de `prefers-reduced-motion`)
- **OGL** — fond WebGL de la page d'accueil (Grainient)
- **EmailJS** — formulaire de contact (côté client, honeypot anti-spam)
- **@fontsource** — polices Manrope & Playfair Display auto-hébergées
- **Biome** — lint + formatage
- **Vitest + Testing Library** — tests unitaires · **Playwright** — E2E

## Développement

```bash
npm install        # installer les dépendances
npm run dev        # serveur de dev (http://localhost:5173)
npm run typecheck  # vérification TypeScript seule
npm run lint       # Biome (lint)
npm run format     # Biome (formatage, écrit les fichiers)
npm test           # tests unitaires (mode watch)
npm run test:e2e   # tests E2E Playwright (build + preview)
npm run build      # type-check + build de production → dossier dist/
npm run budget     # vérifie le poids du chunk d'entrée (gzip)
npm run preview    # prévisualiser le build de production
```

Architecture, flux de données et décisions : [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
Intégration continue (typecheck, lint, tests, build, budget, E2E) :
[`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Déploiement

Le site est déployé sur **Vercel**. Chaque `git push` sur la branche `main`
déclenche automatiquement un nouveau build et une mise en production.

- Framework détecté : Vite
- Commande de build : `npm run build` (échoue si le type-check échoue)
- Dossier de sortie : `dist`
- Routage SPA, en-têtes de sécurité (CSP, HSTS…) : [`vercel.json`](./vercel.json)
- SEO : titres/canonical par route (`PageMeta`), `robots.txt`, `sitemap.xml`,
  balises Open Graph/Twitter dans [`index.html`](./index.html)

## Origine

Le design initial a été produit avec Figma Make, puis le code a été
rapatrié ici pour être maintenu de façon autonome. GitHub est désormais
la seule source de vérité.
