# SYMA — page projet showcase

**Date :** 2026-07-28 · **Statut :** design validé, en implémentation · branche `feat/syma-showcase`

## Objectif
3ᵉ page projet sur-mesure (après Mauni et Onboarding RH), même qualité/ossature.
SYMA = **site-comparateur d'identité de marque** (« SYMA Studio ») : on compare
des directions de logo (A/B), on bascule des palettes, on choisit typo +
iconographie, on vote/valide. Dark, typo display, palettes vives.

## Décisions validées (brainstorming)
1. **Traitement cohérent** avec Mauni/Onboarding (tokens `--portfolio-*`,
   clair/sombre standard) + **accent indigo SYMA** (`--syma-accent`). PAS de
   parti-pris sombre/bespoke.
2. **Signature = comparateur A/B recréé, interactif** avec **les vrais logos
   SVG** (recolorables en live) — pas un stand-in typo. Bascule de palette en
   direct.
3. Contenu FR/EN en premier jet (rôle + impact à affiner par l'utilisateur).
4. Hero = rendu MacBook glowing existant (`syma-hero.webp`).
5. Lien site : `https://logo-syma.vercel.app/`.

## Architecture
- `src/app/pages/SymaShowcase.tsx` + `.css` (scopé `.syma-showcase`), délégué
  depuis `ProjetDetail` quand `id === 'syma'`. Réutilise l'ossature :
  hero morph-aligné (100vw/100vh), rail sticky (scroll-spy, numéros en
  pastilles, lien « Visiter le site »), sections, `ContactFooter`,
  `ImageLightbox`, `PageMeta`. Bilingue via `useT`.
- Accent `--syma-accent` = indigo/périwinkle (`#6366f1` clair / `#818cf8`
  sombre, à affiner). Reste via `--portfolio-*`.

## Assets
- **7 logos SVG** copiés dans `src/assets/syma-logos/` (fat, goofy, journal,
  lebeau, manuscrit, vertical, fluid). Chaque path recoloré en JS
  (`style.fill = 'currentColor'`) → recolor via le `color` du conteneur (CSS).
- **Palettes exactes** (depuis le repo SYMA `js/palettes.js`) :
  - palette1 : `#18233f #788ce3 #92bad4 #f7f3e7 #e0f479 #ff4d6d #000 #fff`
  - palette2 : `#f35b43 #610023 #9f9536 #f7c6dc #f7eee5 #000 #fff`
- **Écrans webp** (`scripts/convert-syma-assets.mjs`) : `syma-iconographie`,
  `syma-typographies`, `syma-valider`. Hero `syma-hero.webp` déjà présent.

## Sections (rail)
```
Hero — MacBook glowing, titre "SYMA", eyebrow "SITE WEB · STUDIO DE MARQUE · 2025"
01 Contexte
02 Rôle (+ interventions)
03 Le comparateur   ← SIGNATURE (voir ci-dessous)
04 Le système       ← iconographie + typographies + valider (fenêtres navigateur)
05 Impact
ContactFooter
```

## Signature — comparateur A/B interactif
- **Deux cartes A / B** côte à côte, chacune affiche un **vrai logo SVG**
  (directions distinctes, ex. A = « le beau », B = « fluid »).
- **Sélecteur de palette** (Palette 1 / Palette 2) : au clic, **les deux cartes
  se recolorent en direct** (fond + logo) avec transition douce (CSS vars
  `--card-bg` / `--logo-color`).
- Styles de carte par palette (fond, logo) définis explicitement :
  - palette1 : A `{bg #18233f, logo #f7f3e7}`, B `{bg #ff4d6d, logo #18233f}`
  - palette2 : A `{bg #610023, logo #f7eee5}`, B `{bg #f35b43, logo #610023}`
- **Rangée des 7 modèles** (mini SVG) sous les cartes — clic = change le logo
  affiché dans A (clin d'œil au « MODÈLE » du vrai site). Nuancier de la palette
  active affiché.
- Recolor SVG : à l'injection (raw `?raw` + dangerouslySetInnerHTML), JS met
  chaque `path` en `fill: currentColor` ; le conteneur porte `color` = couleur
  logo. Réactif au changement de palette via CSS.
- Repli mobile : cartes empilées, sélecteur de palette au-dessus.

## Le système (04)
Les 3 onglets produit (iconographie, typographies, valider) en **fenêtres
navigateur** (composant à réintroduire, léger — mockup `.bwin` retiré au
nettoyage Onboarding, je le remets scopé SYMA), présentation propre.

## Hors périmètre (YAGNI)
- Pas de vote/classement fonctionnel (le comparateur montre le concept, pas le
  back). Pas de recréation de l'onglet typo interactif (capture suffit).
- Contenu = premier jet.

## Critères de réussite
- Niveau de finition Mauni/Onboarding ; comparateur fluide (recolor live) en
  clair ET sombre ; `tsc`/vitest(88)/build/budget OK ; rendu validé en capture.
