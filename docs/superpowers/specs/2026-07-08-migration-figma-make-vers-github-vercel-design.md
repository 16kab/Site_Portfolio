# Migration du portfolio Figma Make → GitHub → Vercel

**Date :** 2026-07-08
**Auteur :** Alexis Kabiche (avec Claude Code)
**Statut :** Validé — prêt pour implémentation

## Objectif

Sortir le portfolio de Figma Make, en faire un projet autonome versionné sur
GitHub (`16kab/Site_Portfolio`), le déployer sur Vercel avec redéploiement
automatique à chaque `git push`, et le brancher sur le domaine
`alexiskabiche.com`. Résultat attendu : **GitHub devient la source de vérité**,
Figma Make n'est plus une dépendance.

## Contexte / état des lieux

- **Source :** `OneDrive - SPVIE/Téléchargements/Interactive Premium Portfolio.zip`
  (export Figma Make daté du 2026-07-08).
- **Stack :** Vite 6 + React 18 + Tailwind 4 (TypeScript).
- **Nature :** SPA statique. React Router (multi-pages), animations GSAP/motion,
  3D via Three.js / @react-three/fiber / drei, formulaire de contact via
  `@emailjs/browser` (côté client, pas de backend).
- **Repo cible :** https://github.com/16kab/Site_Portfolio (vide).
- **Domaine :** `alexiskabiche.com`, déjà possédé. Registrar : à confirmer au
  moment du DNS (les enregistrements sont identiques quel que soit le registrar).
- **Outillage local :** Node 24, npm 11, git 2.45. `gh` CLI **non installé** →
  push via git HTTPS (Git Credential Manager Windows, sinon token).
- **Dossier de travail :** `c:\Users\alexis.kabiche\Projects\Site` (vide au départ).

## Architecture cible

```
GitHub (main)  ──push──▶  Vercel  ──build (vite build → dist/)──▶  CDN + HTTPS
                                                                      │
                                                          alexiskabiche.com
```

- Hébergement 100 % statique (aucun serveur applicatif).
- Vercel : preset **Vite**, build `npm run build`, output `dist`.
- Domaine branché côté Vercel ; SSL automatique.

## Travaux réalisés par Claude (local)

1. **Extraction** du zip dans le dossier projet.
2. **Correction `package.json`** : déplacer `react` et `react-dom` de
   `peerDependencies` (optionnelles, spécificité Figma Make) vers `dependencies`
   — sinon le build Vercel échoue faute de React installé.
3. **Vérification du build en local** : `npm install` puis `npm run build`.
   Corriger les blocages éventuels. **Principal point de risque** (voir plus bas).
4. **Fichiers d'infrastructure** :
   - `.gitignore` (`node_modules/`, `dist/`, logs, `.env*` local).
   - `vercel.json` avec *rewrite SPA* (toutes les routes → `index.html`) pour
     éviter les 404 sur les liens profonds React Router.
   - `README.md` (description, commandes dev/build, note de déploiement).
5. **Git** : `git init`, commit initial, ajout du remote, `push` vers `main`.

## Actions réalisées par l'utilisateur (guidé pas à pas)

6. **Vercel** : créer un compte (login GitHub), importer `Site_Portfolio`,
   confirmer le preset Vite → premier déploiement `*.vercel.app`.
7. **Domaine** : Vercel → *Domains* → ajouter `alexiskabiche.com`. Copier les
   enregistrements DNS fournis (A + CNAME `www`, ou changement de nameservers)
   chez le registrar. Attendre la propagation + SSL automatique.

## Risques identifiés (traités à l'étape 3, ce ne sont pas des décisions)

- `gsap-trial` / `@gsap/react` : vérifier l'installation depuis npm public.
- Compatibilité des versions `three` / `@react-three/fiber` / `drei`.
- EmailJS : confirmer l'absence de secret sensible en dur (les clés « public »
  EmailJS sont conçues pour le client → acceptables).
- Dépendances abondantes de Figma Make (MUI + Radix + …) : **conservées telles
  quelles** pour garantir un premier build fonctionnel ; élagage possible plus
  tard (YAGNI).
- `build` = `vite build` sans `tsc` → les erreurs de typage TypeScript ne
  bloquent pas le build (comportement voulu de Figma Make).

## Critères de vérification (definition of done)

- `npm run build` passe en local sans erreur.
- `npm run dev` : navigation entre pages, animations, 3D et formulaire OK.
- Le repo GitHub contient tout le code (hors `node_modules`/`dist`).
- Le site est accessible en HTTPS sur `alexiskabiche.com`.
- Les liens profonds (ex. `/projets/xxx`) ne renvoient pas de 404.
- Un `git push` déclenche un redéploiement Vercel automatique.

## Hors périmètre (non traité maintenant)

- Optimisation / élagage des dépendances.
- Ajout d'un backend, CMS, analytics.
- CI/CD au-delà de l'intégration native Vercel.
- Refonte du design (on migre l'existant tel quel).
