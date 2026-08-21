# Page « À propos » — refonte bespoke « Manifeste + index »

**Date :** 2026-08-20 · **Statut :** design validé (brainstorming)

## Objectif

Refondre la page `/apropos` en une page **courte, bespoke et personnelle**,
centrée sur **pourquoi** Alexis fait ce métier et **comment** il le fait. Le
détail factuel (parcours, activité, formation) part dans le futur **CV** — pas
sur cette page. On sort du ton corporate abstrait actuel pour un traitement
éditorial « manifeste + index » : une accroche typographique démesurée en tête,
un corps ultra-structuré (index numéroté, filets fins, labels mono) en dessous.

## Décisions validées (brainstorming)

1. **Contenu** = récit resserré autour du *pourquoi / comment*. Le parcours pro
   + formation **quittent** cette page (→ chantier CV).
2. **Le « pourquoi » = la conviction design d'Alexis** (sa philosophie
   actuelle), pas une bio autobiographique. Pas de pavé perso.
3. **Blocs conservés** (l'utilisateur les aime, « concret sans blabla ») :
   Philosophie, Ce que je sais faire, Ce qui guide mon travail. **« Ce que je
   recherche » = condensé à 3 points** (au lieu de 6).
4. **Direction DA** = « Manifeste + index » : hero accroche géante + corps index.
5. **Typo accroche** = display moderne caractériel → **Bricolage Grotesque**
   (self-hosted @fontsource), corps en **Manrope** (existant).
6. **Palette** = **monochrome**, tokens neutres du site, theme-aware (aucun
   accent couleur inventé).
7. **Portrait** = **placeholder** cadré pour l'instant (image fournie plus tard).
8. **Bouton CV** → pointera vers une future page `/cv` ; pour l'instant **câblé
   « bientôt »** (non actif / mène à un placeholder), pas de lien mort.
9. **Menu sticky scrollspy** (Expertises/Principes/Environnement) **supprimé** :
   inutile sur une page courte, simplifie la page.

## État existant (repères)

- `src/app/pages/APropos.tsx` : page actuelle. Contient, en **dur bilingue**
  (FR canonique + EN) : `expertiseSections` (5), `principlesData` (4),
  `environmentData` (6), et un objet `STRINGS` (hero, philosophie P1/P2, labels).
  Ces textes FR/EN sont **réutilisés tels quels** (sauf environnement condensé).
- Composants dispo : `ScrollRevealTitle`, `ScrollFadeIn` (révélation au scroll,
  respectent `prefers-reduced-motion`), `RollingText`, `ContactFooter`,
  `PageMeta`, `InfoCard`/`CardCarousel` (plus utilisés ici après refonte).
- Polices : `src/styles/fonts.css` importe Manrope (400-800) + Playfair via
  `@fontsource`. `--font-sans` = Manrope. On **ajoute** Bricolage Grotesque.
- Tokens couleur : `src/styles/theme.css` — `--portfolio-bg`,
  `--portfolio-text-primary/secondary/description`, `--portfolio-card-bg`,
  `--portfolio-button-*`, versions light (`:root`) + dark (`.dark`).
  **Monochrome, aucun `--portfolio-accent`.** On réutilise ces tokens.
- Route : `ROUTES.APROPOS` (`/apropos`), lazy-loadée dans `App.tsx`. La page est
  couverte par la transition « voile » et remet son scroll en haut au montage.
- Scroll : `document.body.scrollTop` (pas `window`).

## Structure de la page (de haut en bas)

### 1. Hero manifeste

- **Eyebrow** mono/discret : `product & brand designer` (FR) /
  `product & brand designer` (EN — inchangé, terme international).
- **Accroche géante** (Bricolage Grotesque, poids fort, `clamp()` très large,
  `text-wrap: balance`, `letter-spacing` négatif serré). Défaut :
  - FR : « Je conçois des produits qui tiennent debout sans moi. »
  - EN : « I design products that stand on their own without me. »
  - *(Copy centrale : facilement remplaçable ; 2 alternates proposées en fin de
    spec.)*
- **Portrait** : bloc cadré ratio portrait **4:5**, placeholder monochrome
  propre (fond `--portfolio-card-bg`, fin liseré `--portfolio-card-border`,
  petit label discret « portrait »), `max-width:100%`, responsive. Positionné à
  droite de / sous l'accroche selon breakpoint.
- Révélation à l'ouverture via `ScrollRevealTitle` (eyebrow puis accroche,
  léger stagger), sans bloquer le premier paint.

### 2. Le pourquoi — Philosophie

- **Label** de section mono : `(pourquoi)` / `(why)`.
- **Pull-quote** : la philosophie existante (`philosophieP1` + `philosophieP2`),
  rendue en **grand texte** éditorial (pas en petit paragraphe de carte).
  Réutilise le texte FR/EN actuel verbatim.
- Option de mise en valeur : la phrase « La plupart des problèmes ne sont pas
  visuels, ils sont structurels. » (déjà dans `philosophieP1`) peut être
  détachée en exergue. À l'appréciation de l'implémentation (pas de nouveau
  texte).

### 3. Le comment — Index

Trois sous-blocs rendus dans un **langage index commun** : numéro `(0N)`, titre,
description courte, filet fin de séparation. Compact, scannable.

- **3a. Ce que je sais faire** — les **5** `expertiseSections` existantes
  (numéros, titres, descriptions, badges). Rendu **compact** en lignes d'index
  (pas en grosses cartes) : numéro + titre + description + badges en petit.
  Contenu FR/EN réutilisé verbatim.
- **3b. Ce qui guide mon travail** — les **4** `principlesData` existants, en
  lignes d'index. Contenu FR/EN verbatim.
- **3c. Ce que je recherche** — **condensé à 3** parmi les 6 `environmentData` :
  garder **« Impact plutôt que production »**, **« Collaboration réelle »**,
  **« Maturité design »** (les 3 plus définissants). Contenu FR/EN verbatim des
  3 cartes retenues ; les 3 autres sont retirées de la page.

### 4. Voir le CV

- Bouton `Voir le Curriculum Vitae` / `View resume` (texte `cvButton` existant),
  style bouton du site (`--portfolio-button-*`), avec `RollingText` au hover
  (comme aujourd'hui).
- **Cible** : `/cv` **n'existe pas encore**. Comportement intermédiaire :
  bouton présent mais **désactivé visuellement** avec mention discrète
  « bientôt » / « soon » (FR/EN), `aria-disabled`, `pointer-events` neutralisés,
  **aucun lien mort ni 404**. Un `TODO` en commentaire pointe le futur `/cv`.

### 5. Footer contact

- `ContactFooter` conservé en bas (cohérence avec le reste du site).

## Traitement visuel (bespoke, monochrome)

- **Fond** : `--portfolio-bg` (light `#FFFFFF` / dark `#121312`). Page
  `min-h-screen`, padding haut = `--page-padding-top` (comme les autres pages).
- **Typo** :
  - Accroche : **Bricolage Grotesque**, poids 700/800, taille `clamp` très
    ample (≈ `2.5rem` → `6rem`+), interlettrage serré, `text-wrap: balance`.
  - Titres de section / labels : Manrope (600) + labels **mono discrets** en
    `(pourquoi)`, `(0N)` — le langage « index » du site (cf. carousel `/projets`).
  - Corps / descriptions : Manrope 400/500, `line-height` aéré, largeur de ligne
    lisible (~65-75 caractères sur la pull-quote).
- **Grille** : conteneur `max-w-[1920px]` + paddings responsives
  (`px-8 … xl:px-24`) comme l'existant. Index sur colonnes alignées
  (numéro | contenu) avec **filets fins** (`--portfolio-card-border`).
- **Signature** = le **contraste d'échelle** accroche-affiche ↔ index-carré :
  c'est ce qui rend le « concret sans blabla » visible et distingue la page du
  reste du site sans casser la cohérence monochrome.
- **Badges** (expertises) : style discret existant (`--portfolio-badge-*`).

## Motion

- Révélations douces au scroll via `ScrollRevealTitle` / `ScrollFadeIn`
  (déjà utilisés, `prefers-reduced-motion` respecté → pas d'animation).
- Hero : petit stagger eyebrow → accroche → portrait à l'ouverture.
- Aucune animation lourde/parallaxe (on a écarté la piste scrollytelling).
- La page entre/sort via la **transition voile** déjà en place (rien à faire).

## Composants & fichiers

- **Modify** `src/app/pages/APropos.tsx` — réécriture de la structure JSX vers
  « manifeste + index » ; suppression du menu sticky scrollspy
  (`useScrollSpy`, refs, boutons) ; suppression des `InfoCard`/`CardCarousel` ;
  condensation de `environmentData`/`environmentDataEn` à 3 entrées ; ajout de
  l'accroche + labels de section dans `STRINGS` (FR + EN) ; bouton CV « bientôt ».
- **Modify** `src/styles/fonts.css` — ajouter l'import `@fontsource` de
  **Bricolage Grotesque** (poids display, ex. 700/800 ou variable) + variable
  CSS `--font-manifeste` (ou équivalent) ; ne pas toucher `--font-sans`.
- **Add dep** `@fontsource/bricolage-grotesque` (ou `@fontsource-variable/…`) —
  self-hosted, CSP-safe, cohérent avec le setup polices. Si indisponible,
  fallback **Archivo (Expanded)** via `@fontsource/archivo`.
- **Data condensée** : garder FR canonique + EN en parallèle (parité bilingue).
- **Éventuel** petit fichier CSS dédié `APropos.css` si le nombre de styles
  bespoke le justifie (sinon styles inline/utilitaires comme aujourd'hui) —
  choix laissé au plan, en suivant le pattern des pages showcase.
- `PageMeta` / `ROUTE_META[ROUTES.APROPOS]` conservés (SEO/partage inchangés).

## Accessibilité & perf

- Contraste texte/fond conforme dans les deux thèmes (tokens existants OK).
- Accroche = `<h1>` unique ; sections = `<h2>` ; hiérarchie correcte.
- Portrait placeholder `aria-hidden` ou `alt` vide (décoratif tant qu'absent).
- Bouton CV désactivé : `aria-disabled="true"`, non focusable ou focus + libellé
  « bientôt » explicite.
- Nouvelle police : **une seule famille** ajoutée, poids limités (display), pour
  contenir le poids. Budget bundle **≤ 190 kB gzip** (le chunk d'entrée ne doit
  pas régresser au-delà ; la police est un asset séparé, pas dans le JS).
- `prefers-reduced-motion` respecté (composants existants).

## Tests

- Rendu FR : l'accroche, le label `(pourquoi)`, les 5 expertises, les 4
  principes et les **3** items « recherche » sont présents ; les 3 items retirés
  ne le sont **pas**.
- Parité **FR/EN** : mêmes nombres d'items dans les deux langues (5 / 4 / 3) ;
  un test garde-fou sur la longueur des tableaux condensés.
- Bouton CV : présent, **désactivé** (`aria-disabled`), ne provoque pas de
  navigation.
- Le menu sticky scrollspy n'est plus rendu (absence des boutons
  Expertises/Principes/Environnement de navigation).
- `PageMeta` monté (SEO).
- La page remet le scroll en haut au montage (comportement conservé).

## Critères de réussite

- Page nettement **plus courte** et personnelle, centrée pourquoi/comment ;
  parcours/formation absents (renvoyés au CV). Accroche manifeste en Bricolage
  Grotesque, corps index monochrome, theme-aware light/dark. Blocs Philosophie /
  Ce que je sais faire / Ce qui guide / (3×) Ce que je recherche présents, FR+EN.
  Bouton CV « bientôt ». `tsc` / Biome / build / tests / budget verts. Rendu
  relu light **et** dark, desktop **et** mobile.

## Annexe — accroches alternates (copy)

Si l'accroche par défaut ne convient pas, swap direct (une ligne, FR+EN) :

- **B.** FR « Le bon design disparaît. Ce qui reste, c'est l'usage. » ·
  EN « Good design disappears. What remains is the use. »
- **C.** FR « La plupart des problèmes ne sont pas visuels. Ils sont
  structurels. » · EN « Most problems aren't visual. They're structural. »
