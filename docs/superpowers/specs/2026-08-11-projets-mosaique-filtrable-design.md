# Page Projets — mosaïque éditoriale filtrable

**Date :** 2026-08-11 · **Statut :** design validé (brainstorming visuel companion)

## Objectif
Refondre la page `/projets` (`Projets.tsx` + `NewProjectCard`) : passer de la
**liste verticale texte-riche** à une **mosaïque éditoriale d'images
filtrable par discipline**, dans un esprit « awwwards » (image-forward, tri
spectaculaire). On **conserve** le morph d'ouverture d'image et les hovers.

## Décisions validées
1. **Concept = mosaïque éditoriale (B2)** : tuiles-image de tailles variées
   (rythme asymétrique, pas une grille uniforme), filtrables.
2. **Filtres = 3 disciplines par médium** (une seule par projet) :
   **Mobile · Web · Branding** (+ `Tous` par défaut). Pas de « UX » (double-
   compterait le web).
3. **Titre + discipline TOUJOURS visibles** (léger dégradé bas de tuile),
   intensifiés au survol. Pas de titre au-survol-seul (illisible, KO tactile).
4. **Conservé** : le **morph** image→plein écran au clic ; le hover **bouton**
   « Voir le projet » (`RollingText`) ; le hover **bordures** (`BorderGlow`) ;
   le header « Projets » + eyebrow.
5. **Retiré** : la ligne-liste (numéro, description longue, badges de tags).
   La description détaillée reste sur la page projet.

## Mapping disciplines (à graver dans les données)
- **mobile** : `mauni`, `trackit`, `mobile-cgrm`
- **web** : `onboarding-rh`, `refonte-spvie`, `parcours-spvieassurances`, `crm-bigbroker`
- **branding** : `syma`, `agpt`, `charte-spvie`

## Tailles de tuiles (curées, rythme éditorial ; ajustables)
- **l** (grande) : `mauni`, `mobile-cgrm`, `agpt`
- **m** (moyenne) : `syma`, `trackit`, `refonte-spvie`, `crm-bigbroker`
- **s** (petite) : `onboarding-rh`, `parcours-spvieassurances`, `charte-spvie`

## Modèle de données (`projetsData.ts`)
Ajout sur `interface Projet` :
```ts
category: 'mobile' | 'web' | 'branding';
tileSize?: 'l' | 'm' | 's'; // défaut 'm'
```
Renseigner les 10 projets. `getTousProjets(lang)` **expose** `category` et
`tileSize` (en plus de `link`, `text`, `image`, etc. déjà présents). Les
`tags`/`description` restent dans les données (utilisés ailleurs) mais ne sont
plus rendus sur les tuiles.

## Composants
- **`Projets.tsx`** (page) : conserve la logique morph existante (scroll
  restore + `beginReverse` au retour via `cardRefs[projectLink]`). Rend :
  header + `<FilterBar>` + `<ProjetsMosaic>`. État `activeCategory`
  (`'all' | 'mobile' | 'web' | 'branding'`) local.
- **`FilterBar`** (nouveau, `components/common/`) : les chips de discipline.
  Boutons (rôle `radio`/`tab`), sélection unique, `Tous` par défaut. Style
  chip actif = accent portfolio, inactifs = bordure. Compte optionnel par
  catégorie. Scrollable horizontalement en mobile.
- **`ProjetTile`** (nouveau, remplace `NewProjectCard`) : une tuile.
  - `<BorderGlow>` conservé autour.
  - `<Link>` + logique clic = **exactement** celle de `NewProjectCard`
    (`captureSnapshot`/`beginForward` depuis le rect de l'image, timer +
    `navigate`, garde `prefersReducedProjectMotion`, `preloadProjetDetail`).
    Le conteneur image porte `imageContainerRef` ; l'`<img>` reçoit le `ref`
    externe (pour le reverse-morph).
  - Contenu : `<img object-cover>` plein cadre + **scrim bas** (dégradé) avec
    titre + discipline ; au survol : soulèvement (`translateY`), zoom léger de
    l'image, scrim renforcé, **bouton « Voir le projet »** (`RollingText`)
    révélé. Focus-visible = mêmes états que hover (a11y).
  - Taille pilotée par `tileSize` → classe (`tile-l/m/s`) qui fixe le
    `grid-column: span` + `aspect-ratio`.

## Mosaïque (grille CSS)
- Desktop : `display: grid; grid-template-columns: repeat(12, 1fr);
  grid-auto-flow: dense; gap: clamp(...)`. Spans par taille :
  `l` → span 7, `m` → span 5, `s` → span 4 (à ajuster pour un pavage propre) ;
  `aspect-ratio` par taille (ex. l/m 4/3, s 1/1). `dense` comble les trous.
- **Tri (FLIP)** : les tuiles sont des `motion.div` avec `layout` +
  `<AnimatePresence>` : au changement de filtre, les tuiles hors-catégorie
  **sortent** (fade+scale), les restantes **se repositionnent en fluide**.
  `prefers-reduced-motion` → pas d'animation de layout (bascule instantanée).
- **Mobile** (≤ ~760px) : `grid-template-columns: 1fr` (toutes tuiles pleine
  largeur, tailles égalisées) ; chips de filtre en ligne scrollable.

## Ce qui NE change pas (à préserver absolument)
- `PageTransitionOverlay` / `PageTransitionContext` (le morph) : **inchangés**.
  La tuile fournit le même `snapshot` (imageSrc + imageRect + projectLink +
  originPath + scrollTop) que `NewProjectCard` aujourd'hui.
- Le **reverse-morph** au retour projet→liste (Projets.tsx `cardRefs` +
  `beginReverse`) : la ref image de la tuile alimente `cardRefs[link]`.
- Restauration de scroll de la liste (déjà en place).

## Accessibilité & perf
- Chips = vrais boutons, navigables clavier, `aria-pressed`/`aria-selected`,
  focus visible. Tuile = lien avec `aria-label` (titre). `prefers-reduced-
  motion` respecté (hover/lift + FLIP désactivés, morph déjà géré).
- `loading="lazy"` sauf 2-3 premières tuiles (`fetchPriority high`).

## Critères de réussite
- Mosaïque asymétrique fidèle à B2, filtre discipline qui **recompose la
  mosaïque en fluide**, titres lisibles au repos, hover (lift+glow+zoom+bouton)
  et **morph au clic conservés** (aller ET retour). Responsive 1 colonne en
  mobile. `tsc` / Biome / build / **88 tests** / budget verts ; captures
  relues (desktop light+dark, mobile, un filtre actif). Aucun régression du
  morph.
