# Onboarding RH — page projet « showcase »

**Date :** 2026-07-23
**Statut :** design validé, prêt pour le plan d'implémentation
**Projet parent :** portfolio (`c:/Users/alexis.kabiche/Projects/Site`)

## Objectif

Créer une page de détail projet sur-mesure pour **Onboarding RH** (plateforme
web interne SPVIE d'intégration des nouveaux collaborateurs), au **même niveau
de qualité que la page Mauni** (`MauniShowcase`). Spécificité : le produit a
**deux espaces distincts** — l'espace **arrivant** (nouveau collaborateur) et
l'espace **RH/admin** — qu'il faut mettre en valeur tous les deux.

## Contexte produit (ce que montrent les écrans)

Plateforme web interne, **accent vert Spvie**, UI en thème clair uniquement.

- **Espace arrivant** : accueil chaleureux (« Bienvenue, Camille »), parcours
  d'intégration **gamifié** (validation d'étapes, écran « Bravo ! » + confettis,
  feedback « Utile / Pas clair / Trop long »), organigramme d'équipe, contacts
  (manager référent, contact RH), documents.
- **Espace RH/admin** : tableau de bord de pilotage (collaborateurs suivis,
  retards, points de suivi en alerte, Business Units), **modèles de bienvenue**
  configurables, **constructeur de parcours** en kanban par Business Unit
  (tronc commun + branches Tech, Commerce, RH, Finance…).

## Décisions validées (via brainstorming)

1. **Dualité → deux chapitres distincts.** Chaque espace a sa propre section
   complète avec sa galerie ; une **charnière « face-à-face »** entre les deux
   relie le kanban RH au parcours vécu par l'arrivant.
2. **Assets → écrans individuels** fournis par l'utilisateur (voir plus bas).
3. **Contenu → premier jet FR/EN rédigé par l'assistant**, l'utilisateur affine
   ensuite son **rôle exact** et l'**impact réel** (chiffres).
4. **Mockups → fenêtres navigateur** (chrome : pastilles + barre d'adresse), pas
   de mockup iPhone. Le **hero garde le rendu MacBook** existant.
5. **Accent vert Spvie** (`--onboarding-accent`, variantes clair/sombre).
6. **Bilingue FR/EN**, contenu codé en dur dans le composant (comme Mauni).
7. Pas de toggle clair/sombre de galerie (UI Spvie en clair only), pas d'effet
   3D (retiré de Mauni aussi).

## Architecture

- **Nouveau composant** `src/app/pages/OnboardingRHShowcase.tsx` +
  `OnboardingRHShowcase.css` (scopé `.onboarding-showcase`).
- **Délégation** : dans `ProjetDetail.tsx`, après les hooks + lookup projet,
  `if (projet.id === 'onboarding-rh') return <OnboardingRHShowcase projet={projet} />;`
  (même mécanisme que `mauni` → `markArrival()` de la transition carte→détail
  fonctionne).
- **Réutilise de Mauni** (patterns, adaptés) :
  - Hero plein cadre `100vw × 100vh` aligné sur la fin du morph (`getFullRect`).
  - Rail d'index gauche avec scroll-spy (IntersectionObserver).
  - Titres **Bricolage Grotesque** + illumination mot-par-mot (`renderWords`,
    spans `.wd` en JSX).
  - Secondaire **Manrope**, tokens `--portfolio-*` (thème clair/sombre).
  - Galerie horizontale épinglée (`hwrap`/`hpin`/`hviewport`/`htrack`, barre
    « Défiler », fondus latéraux couvrant légende + ombre).
  - `ContactFooter`, `ImageLightbox`, `PageMeta`.
- **Nouveau** : composant **mockup fenêtre navigateur** (chrome CSS : 3
  pastilles + barre d'adresse `rh.spvie.dev` / `spvie.dev`, ombre portée). En
  CSS, dans le style « bordure/ombre » robuste appris sur Mauni (pas de
  `z-index:-1` qui lâche après une anim de reveal).
- **Note archi (dette assumée)** : d'autres pages projet suivront (SYMA,
  Trackit…). Pour cette page, on **adapte** les mécaniques Mauni (duplication
  partielle assumée) sans casser Mauni ni ses tests. **Extraction** des
  primitives communes (galerie épinglée, mockup, rail scroll-spy) en module
  partagé `src/app/components/showcase/` **différée** à la 3ᵉ page qui les
  réutilisera, quand les patterns seront stabilisés.

## Structure de la page (sections = rail d'index)

```
Hero          — rendu MacBook (chaise verte), titre « Onboarding RH »,
                eyebrow « PLATEFORME WEB INTERNE · SPVIE · 2025 », thèse.
01 Contexte   — point de départ : onboarding dispersé, sans suivi.
02 Rôle       — rôle sur le projet + problématique (deux publics mal servis :
                RH sans pilotage, arrivant perdu). Liste d'interventions.
03 Espace arrivant — galerie navigateur :
                accueil → parcours → détail étape → success (Bravo) → équipe.
   ⋯ Charnière « face-à-face » : Admin/parcours (kanban RH) ↔ arrivant/parcours,
     reliés par un trait + phrase « ce que le RH construit → ce que l'arrivant vit ».
04 Espace RH  — galerie navigateur :
                accueil (tableau de bord) → Bienvenue (modèles) → parcours
                (kanban) → détail étape → équipe.
   Bandeau vert (stat de pilotage, façon bandeau Mauni — chiffre à définir avec
   l'utilisateur, ex. « 5 Business Units · 19 étapes · un parcours par métier »).
05 Impact     — résultats (premier jet, à affiner : visibilité RH, autonomie
                des arrivants, 0 étape oubliée…).
ContactFooter
```

## Galeries & mockups

- Chaque espace = **une galerie horizontale épinglée** (mécanique Mauni) ;
  chaque écran dans une **fenêtre navigateur**.
- Écrans **paysage** (~1845×945, ratio ~1,95) → fenêtres larges, ~1,5 visible à
  la fois. **Risque connu** : le défilement horizontal peut paraître long avec
  des fenêtres larges → prévoir un repli (réduire la hauteur des fenêtres, ou
  moins d'écrans par galerie) et **valider visuellement** en capture. Décision
  finale de mise en page à l'implémentation, après premier rendu.
- Clic sur un écran → zoom `ImageLightbox`. Pas de toggle clair/sombre.

## Charnière « face-à-face »

Diptyque **statique** (hors galerie épinglée) entre les chapitres 03 et 04 :
- Gauche : `Admin/parcours` (kanban de construction du parcours).
- Droite : `arrivant/parcours` (le parcours vécu, gamifié).
- Reliés par un trait/flèche + phrase-clé bilingue « ce que le RH construit →
  ce que l'arrivant vit ». Un seul moment fort, révélé au scroll (`.reveal`).

## Contenu rédactionnel

Premier jet **FR/EN** rédigé par l'assistant (contexte, problématique, rôle,
interventions, démarche implicite dans les chapitres, impact), codé en dur dans
le composant via `useT`. L'utilisateur affinera **son rôle exact** et
**l'impact chiffré**. `projetsData.ts` (Onboarding RH) reste en
`[Texte provisoire]` — le contenu vit dans le composant (comme Mauni).

## Assets (fournis par l'utilisateur)

Source : `C:\Users\alexis.kabiche\OneDrive - SPVIE\…\Portfolio\Onboarding RH`

- **Admin/** : `accueil.png` (tableau de bord), `Bienvenue.png` (modèles),
  `parcours.png` (kanban), `détail étape.png`, `Equipe.png`.
- **arrivant/** : `accueil.png`, `parcours.png`, `détail étape.png`,
  `success.png` (Bravo), `Equipe.png`.
- Hero : rendu MacBook existant (`src/assets/onboarding-rh-hero.webp`, déjà en
  place) — conservé.

À l'implémentation : conversion **webp** + renommage propre (ex.
`onb-arrivant-accueil.webp`, `onb-rh-tableau-de-bord.webp`) dans `src/assets/`.

## Accent & thème

- `--onboarding-accent` = vert Spvie (défini clair + override `.dark`), en
  remplacement local de `--mauni-accent`. Le reste des couleurs via les tokens
  `--portfolio-*` existants (fond, textes, cartes).

## Ce qui est hors périmètre (YAGNI)

- Pas de refactor des autres pages projet (SYMA, Trackit…) maintenant.
- Pas d'extraction de module partagé `showcase/` dans ce lot.
- Pas de rédaction du contenu final « vrai » (premier jet uniquement).
- Pas de toggle clair/sombre de galerie, pas d'effet 3D.

## Critères de réussite

- Page Onboarding RH au niveau de finition de Mauni (hero morph aligné, rail
  scroll-spy, galeries épinglées fluides, footer, lightbox).
- Les **deux espaces** sont clairement présentés et mis en valeur, avec la
  charnière qui relie les deux.
- `tsc` OK, `vitest` (88 tests) OK, build OK.
- Rendu validé en capture (Playwright) en clair et sombre, desktop.
