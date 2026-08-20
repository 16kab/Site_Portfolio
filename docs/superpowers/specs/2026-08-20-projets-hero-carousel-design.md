# Page Projets — hero-carousel éditorial (nouvelle DA)

**Date :** 2026-08-20 · **Statut :** design validé (brainstorming)

## Objectif
Remplacer la **mosaïque filtrable** de `/projets` par un **hero-carousel
éditorial plein écran** (pellicule de cartes-portraits, une carte focus
déployée en pleine hauteur, fond re-gradé à la couleur du projet actif). On
**câble les 10 vrais projets** et on **conserve le morph** image→page projet
au clic (aller ET retour).

Source : composant `hero-carousel.tsx` fourni par l'utilisateur (style shadcn).
Il est **adapté à notre stack** (pas de shadcn) et à la **typo du site**.

## Décisions validées (brainstorming)
1. **Remplace la mosaïque** : le carousel DEVIENT `/projets`. On retire
   mosaïque, `ProjetTile`, `FilterBar`, filtre par discipline.
2. **Câblé aux 10 vrais projets** (`getTousProjets(lang)`).
3. **Morph conservé** : clic sur la carte focus → morph image→détail ; retour
   détail→liste → focus la carte du projet + reverse-morph.
4. **Typo** : titre + textes → **Manrope** (police cœur du site) ; petits
   labels (credit, meta, numéros du rail) → **mono** (pile mono système, pas de
   font chargée — bundle léger ; upgradable Space Mono/JetBrains plus tard).
5. **credit** = **discipline** (`MOBILE` / `WEB` / `BRANDING`) · **meta** =
   **[année]**.
6. **Exécution** : subagent-driven-development.

## Stack (vérifié)
- `motion/react` (pkg `motion` déjà installé) — on remplace l'import
  `framer-motion` du composant par `motion/react`. **Aucune install.**
- `cn` existe (`@/lib/utils`), alias `@/*` → `./src/*`. OK.
- Tailwind v4 (config CSS, pas de `tailwind.config`). Classes utilitaires OK.
- Convention fichiers : `src/app/components/…` (pas `/components/ui`).

## Composants & fichiers
### `src/app/components/common/HeroCarousel.tsx` (nouveau)
Portage du composant fourni, avec ces adaptations :
- Import `{ AnimatePresence, animate, motion, useMotionValue, useReducedMotion }`
  depuis **`motion/react`**.
- `cn` depuis `@/lib/utils`.
- **Retirer la top-bar** interne (`brand` / `onBack` / `onMenu`) : le `Header`
  du site existe déjà (double barre sinon). Props supprimées ou simplement non
  passées + bloc top-bar retiré du JSX.
- **Typo** : le composant n'impose aucune police (hérite de `font-sans` +
  `font-mono` Tailwind). On force :
  - titre `.h2` et textes → `font-family: 'Manrope', sans-serif`.
  - labels `credit` / `meta` / numéros rail → pile **mono** :
    `ui-monospace, SFMono-Regular, Menlo, monospace` (remplacer les classes
    `font-mono` par cette famille explicite, l'aspect majuscules +
    `tracking` est déjà dans le composant).
- **Nouvelle prop `onItemActivate?`** pour le morph (voir § Morph). Le reste de
  l'API (`items`, `index`/`defaultIndex`, `onIndexChange`, `autoplay`…) reste.
- **Exposition de l'image focus** pour le reverse-morph (voir § Morph) : la
  carte focus doit pouvoir remonter son `<img>` (via `onItemActivate` pour
  l'aller, et via une prop `focusedImageRef`/callback pour le retour).
- **A11y conservée** (rôle carousel, clavier ←/→/Home/End, `aria-current`).
- Types `HeroCarouselItem` / `HeroCarouselProps` conservés (+ ajouts ci-dessus).

### `src/app/data/projetsData.ts` (+ `.en.ts` inchangé)
- Ajouter au type `Projet` un champ non-textuel **`accent?: string`** (couleur
  signature, partagée FR/EN comme `image`/`year`).
- Renseigner les 10 projets (hex **curés depuis la DA de chaque page**,
  ajustables par l'utilisateur) :
  | id | accent (proposé) |
  |----|------|
  | mauni | `#E4674F` (coral) |
  | onboarding-rh | `#10B981` (émeraude) |
  | syma | `#18233F` (navy) |
  | trackit | `#F56416` (orange) |
  | parcours-spvieassurances | `#12C69A` (vert SPVIE) |
  | crm-bigbroker | `#05D7CD` (teal) |
  | agpt | `#E93C8C` (rose) |
  | refonte-spvie | `#0A9D7A` (émeraude profond) |
  | charte-spvie | `#1F6F5C` (vert-pin) |
  | mobile-cgrm | `#2BB3C0` (teal-cyan) |
- `getTousProjets`/`tousProjets` exposent `accent`.

### `src/app/pages/Projets.tsx` (réécriture)
- Construit `items: HeroCarouselItem[]` depuis `getTousProjets(lang)` :
  `title` = titre · `image` = `image` · `credit` = label discipline
  (`category` → `MOBILE`/`WEB`/`BRANDING`, traduit) · `meta` = `[year]` ·
  `accent` = `accent` · `id` = `link`.
- Rend : `<HeroCarousel>` en **100vh** + `<ContactFooter>` en dessous. Header
  du site au-dessus (déjà global).
- **Conserve** la logique morph existante (scroll-restore, `beginReverse` au
  retour) adaptée au carousel (voir § Morph).
- **Retire** : `ProjetTile`, `FilterBar`, `filterProjets`, l'état `filter`, la
  grille mosaïque. (`filterProjets.ts` + `FilterBar.tsx` + `ProjetTile.tsx`
  deviennent inutilisés sur `/projets` — voir § Nettoyage.)

## Morph (parité à préserver absolument)
Le morph actuel (`PageTransitionContext` : `captureSnapshot` + `beginForward`
depuis le rect de l'image ; retour via `beginReverse` sur `cardRefs[link]`)
reste **inchangé côté contexte/overlay**. Intégration dans le carousel :

**Aller (ouvrir un projet)**
- Clic sur la carte **déjà focus** (i === index) → ouvre le projet.
  (Clic sur une carte non-focus → la focus, comportement natif `go(i)`.)
- `HeroCarousel` appelle `onItemActivate(index, imgElement)` où `imgElement`
  est le `<img>` de la carte focus.
- `Projets.tsx` fournit `onItemActivate` = **exactement la logique
  `handleClick` de `ProjetTile`** : `captureSnapshot({ imageSrc, imageRect
  (depuis imgElement.getBoundingClientRect()), projectLink, originPath,
  scrollTop })`, `beginForward`, garde `prefersReducedProjectMotion`,
  `preloadProjetDetail`, timer + `navigate`.
- Affordance d'ouverture : ajouter dans le bloc titre un petit cue mono
  **« VOIR LE PROJET ↗ »** (cliquable, déclenche le même `onItemActivate`) pour
  rendre l'ouverture évidente et garder un clin d'œil au bouton hover d'avant.

**Retour (détail→liste)**
- Au montage, si `isReturnVisit`, `Projets.tsx` **focus la carte du projet
  d'origine** : il calcule l'index du `originPath`/projectLink et le passe en
  `index` (contrôlé) au carousel (slide sans animation si `reduce`).
- Le carousel expose le `<img>` de la carte focus (prop
  `focusedImageRef`/callback) → `Projets.tsx` alimente `cardRefs[link]` avec
  cette image et lance `beginReverse` dessus (logique retour actuelle).
- Restauration du scroll de page conservée.

## Layout & responsive
- Desktop : carousel `height: 100vh` (ou `100dvh`), plein écran, sous le Header.
  `ContactFooter` en dessous ; le composant **rend la main au scroll** en bout
  de pellicule (scroll-chaining déjà implémenté) → on descend au footer.
- Theme-aware : le carousel est **sombre par design** (fond noir + photo
  gradée). Vérifier le rendu en **light ET dark** (le Header/Footer partagés
  doivent rester cohérents) ; forcer un fond sombre local si besoin, comme les
  pages showcase sombres.
- **Mobile** : la géométrie est ratio-based (`ResizeObserver`). Vérifier que la
  pellicule reste utilisable en < 640px (cartes pas trop petites, titre
  lisible, rail visible) ; ajuster les ratios si nécessaire (ex. `CARD_H`,
  gutters) sous un breakpoint. `reduced-motion` respecté (déjà géré).

## Accessibilité & perf
- Rôle carousel + clavier conservés. Le cue « Voir le projet » est un vrai
  bouton/lien avec `aria-label`.
- `loading="lazy"` sur les images non-focus si pertinent (le composant charge
  toutes les `<img>` ; garder les 2-3 premières prioritaires).
- Budget bundle : pas de nouvelle police (mono système). Rester ≤ 190 kB gzip.

## Nettoyage
- `ProjetTile.tsx` + `.css`, `FilterBar.tsx` + `.css`, `filterProjets.ts`
  ne sont plus utilisés par `/projets`. Vérifier qu'ils ne sont utilisés nulle
  part ailleurs ; si oui, **les supprimer** (avec leurs tests) ; sinon les
  laisser (décision à la revue). `NewProjectCard` reste (section « autres
  projets » des pages détail).
- MàJ des tests : `Projets.test.tsx` (mock `HeroCarousel`, asserte le mapping
  des 10 items + le câblage morph) ; supprimer/adapter les tests mosaïque
  (`filterProjets.test.ts`, tests `ProjetTile`) selon le nettoyage.

## Critères de réussite
- `/projets` = hero-carousel plein écran, 10 vrais projets, fond qui vire à
  l'accent du projet actif, titre en Manrope, labels mono, credit=discipline /
  meta=année. Morph **aller ET retour** conservé (parité exacte). Footer
  accessible en fin de pellicule. Responsive mobile OK. Theme light+dark relus.
  `tsc` / Biome / build / tests / budget verts. Captures relues.
- **Aucune régression du morph** (le point critique).
