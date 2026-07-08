# Portfolio — Alexis Kabiche

Site portfolio personnel de designer UX/UI. Application web statique
(SPA) construite avec **Vite + React + Tailwind CSS**.

🌐 En ligne : [alexiskabiche.com](https://alexiskabiche.com)

## Stack

- **Vite 6** — build & serveur de dev
- **React 18** + **TypeScript**
- **Tailwind CSS 4**
- **React Router 7** — navigation multi-pages
- **GSAP / Motion** — animations
- **Three.js / React Three Fiber** — éléments 3D
- **EmailJS** — formulaire de contact (côté client)

## Développement

```bash
npm install      # installer les dépendances
npm run dev      # serveur de dev (http://localhost:5173)
npm run build    # build de production → dossier dist/
npm run preview  # prévisualiser le build de production
```

## Déploiement

Le site est déployé sur **Vercel**. Chaque `git push` sur la branche `main`
déclenche automatiquement un nouveau build et une mise en production.

- Framework détecté : Vite
- Commande de build : `npm run build`
- Dossier de sortie : `dist`
- Le routage SPA (React Router) est géré par [`vercel.json`](./vercel.json)
  (toutes les routes retombent sur `index.html`).

## Origine

Le design initial a été produit avec Figma Make, puis le code a été
rapatrié ici pour être maintenu de façon autonome. GitHub est désormais
la seule source de vérité.
