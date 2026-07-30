# TrackIt — page projet showcase

**Date :** 2026-07-30 · **Statut :** design validé, en implémentation · branche `feat/trackit-showcase`

## Objectif
4ᵉ page projet sur-mesure (après Mauni, Onboarding RH, SYMA). **1er projet
mobile.** TrackIt = **app mobile de suivi de films & séries** : watchlist « À
voir », détail série avec **barre de progression** (vu/en cours/restant) et
épisodes cochables, recherche/tendances, historique, paramètres.

## Décisions validées (brainstorming)
1. **Traitement = cinématique sombre** (bespoke, colle à la DA de l'app) — PAS
   le template neutre clair/sombre des 3 autres. La page a ses propres tokens
   sombres scopés `.trackit-showcase`, et **force le thème `dark` du site à
   l'entrée** (mémorise l'état, restaure en sortie) pour que header/footer
   (tokens `--portfolio-*`/`--header-*`) collent au fond noir.
2. **Signature = le suivi d'épisodes recréé, interactif** : écran Détail série
   avec carte Progression (barre vert/orange/gris) + saisons dépliables +
   cases « vu » cochables. Cocher → la barre avance en direct + compteur X/Y.
3. Mockups **iPhone** (cadre CSS : bezel, coins, encoche) — 1er projet mobile.
4. Contenu FR/EN premier jet (rôle + impact à affiner). Hero = mockup « iPhone
   en main » cinématique.
5. Pas de lien « Visiter le site » (app mobile) — barre méta sans lien (ou lien
   proto si fourni plus tard).

## DA / Palette (tirée de l'app)
- Fond `#0a0a0c` · surfaces `#141417`–`#1b1b20` · cartes `#1a1a1e`
- Texte `#f5f5f7` / secondaire `#9a9aa2` / muted `#6c6c74`
- **Accent orange `#f2661f`** (barres « en cours », icônes actives, tags SÉRIE TV)
- **Vert `#3ecf7e`** (vu / complet) · **Or `#ffce4a`** (note ★)
- Bordures `rgba(255,255,255,0.08)` · Titres Bricolage Grotesque · Corps Manrope

## Architecture
- `src/app/pages/TrackItShowcase.tsx` + `.css` (scopé `.trackit-showcase`),
  délégué depuis `ProjetDetail` quand `id === 'trackit'`. Réutilise l'ossature :
  hero morph-aligné (100vw/100vh), barre méta, sections, reveal au scroll,
  illumination des titres, `ContactFooter`, `PageMeta`. Bilingue via `useT`.
- **Forced-dark** : `useEffect` au montage ajoute `dark` sur `documentElement`
  si absent, retire au démontage (sans toucher `localStorage`, la préférence
  utilisateur est préservée).

## Assets (`scripts/convert-trackit-assets.mjs`)
- `trackit-hero.webp` (mockup en main, paysage), écrans téléphone
  `trackit-{avoir,recherche,historique,commencer,detail}.webp` (portrait),
  `trackit-dd-backdrop.webp` (art Daredevil recadré, sans texte, pour la
  signature).

## Sections
```
Hero — mockup en main, titre "TrackIt", eyebrow "APP MOBILE · SUIVI FILMS &
       SÉRIES · 2025", thèse « Ne perdez plus le fil de vos séries. »
Barre méta — Rôle (UX/UI & Product) · Nature (App mobile) · Portée · Année
01 Contexte — le problème (jongler entre plateformes, oublier où on en est),
   posé sur une bande de posters « À voir »
02 Le suivi d'épisodes  ← SIGNATURE (interactif, voir ci-dessous)
03 Les écrans — À voir / Recherche / Historique / Commencer en mockups iPhone
04 Impact — résultats (premier jet)
ContactFooter
```

## Signature — suivi d'épisodes interactif
- Recréation HTML/CSS de l'écran Détail série : backdrop (`trackit-dd-backdrop`)
  + scrim, titre « Daredevil : Born Again », tag `SÉRIE TV` (contour orange),
  note ★ 8.2 (or).
- **Carte Progression** : barre segmentée **vert = vus** / gris = restants,
  compteur « X / Y épisodes », libellé « En cours »/« Complet ».
- **Liste de saisons** dépliables (Saison 1 : 9 ép., Saison 2 : 8 ép.), chaque
  ligne épisode = n°, titre, date, note, **case « vu » cochable** (cercle →
  coche verte). Toggle saison = coche/décoche tous ses épisodes.
- État React : `episodes[{season, title, date, rating, watched}]`. Cocher met à
  jour la barre (part vert = vus/total) + le compteur, transition douce. Data
  codée en dur d'après la capture (titres « L'étoile polaire », « Viser plus
  haut », « La balance et l'épée »…, dates 2026-03-xx, notes ★).
- Repli mobile : liste verticale, barre pleine largeur.

## Mockups iPhone (03)
- Cadre CSS `.iphone` : bezel sombre arrondi (~44px radius), encoche (notch)
  centrée, ombre. Capture en `object-fit: cover` dedans. Rangée/carrousel de 3-4
  téléphones (À voir, Recherche, Historique, Commencer), légères inclinaisons /
  décalages pour la profondeur. Repli mobile : empilés / scroll horizontal.

## Hors périmètre (YAGNI)
- Pas de recherche fonctionnelle ni de vraie donnée TMDB. Pas de recréation de
  tous les écrans (captures suffisent hors signature). Contenu = premier jet.

## Critères de réussite
- Niveau de finition Mauni/Onboarding/SYMA ; cinématique sombre cohérent
  (header/footer compris) ; suivi d'épisodes fluide (barre qui avance) ;
  `tsc`/vitest(88)/build/budget OK ; rendu validé en capture.
