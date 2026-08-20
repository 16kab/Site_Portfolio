# Transition de page — voile sombre cinématique

**Date :** 2026-08-20 · **Statut :** design validé (brainstorming)

## Objectif
Ajouter une **transition de page** à **tous les changements de route** : un
**voile sombre plein écran** balaie l'écran (couvre), la nouvelle page se monte
sous le voile, puis le voile se retire (révèle). Le voile a des **bords haut/bas
adoucis** (dégradé vers 0 % d'opacité) pour un balayage très doux. Fait le pont
entre l'Accueil clair et le carousel Projets sombre, et unifie toute la nav.

## Décisions validées (brainstorming)
1. **Feel** = voile sombre cinématique (pas fondu, pas morph d'élément).
2. **Portée** = toutes les routes.
3. **Le voile couvre TOUT** (plein viewport, header inclus).
4. **Bords haut/bas du voile en opacité 0** (dégradé), pas de bord net.
5. **Coexistence** : le morph image carte→détail et le reverse détail→liste
   restent gérés par `PageTransitionOverlay` ; le voile est **supprimé** quand
   un morph projet est actif.
6. `prefers-reduced-motion` → **pas de voile** (swap instantané).

## État existant (repères)
- `App.tsx` → `AppContent` rend `<Routes location={location}>` dans un
  `<Suspense>` (pages secondaires en `lazy`). **Aucune** transition de route
  aujourd'hui (coupe sèche).
- `ScrollToTop` remet le scroll en haut à chaque changement de route.
- `PageTransitionContext` expose l'état du morph projet (`isTransitioning`,
  `direction`, snapshot) ; `PageTransitionOverlay` joue le morph.
- Header, fond (BackgroundWrapper), overlay morph sont **hors** `<Routes>` (dans
  `App`), donc persistants entre routes.

## Mécanisme — « swap de route masqué par le voile »
Le piège : changer la route d'abord fait flasher la nouvelle page avant que le
voile ne couvre. Solution : on dissocie ce qui est **affiché** de la location
du routeur.

- Un contrôleur garde `displayedLocation` (state). `<Routes location=
  {displayedLocation}>` ne rend donc **que** la page affichée.
- Quand la location du routeur change (≠ `displayedLocation`) :
  - **Cas sans voile** (morph projet actif OU reduced-motion) : on pose
    `displayedLocation = location` **immédiatement** (le morph/overlay gère la
    transition, ou swap instantané).
  - **Cas voile** : on lance **voile IN** (couvre). À la fin de la couverture
    (`onAnimationComplete`), on pose `displayedLocation = location` (la nouvelle
    page se monte **sous** le voile) + **reset scroll en haut**, puis **voile
    OUT** (révèle).
- Détection « morph actif » : lire `PageTransitionContext`
  (`isTransitioning`/`direction`) au moment où la location change. Si un morph
  est en cours → pas de voile.
- Montage initial : `displayedLocation` initialisée à la location courante →
  **aucun voile au premier rendu**.
- Les pages `lazy` chargent pendant que le voile couvre (fallback masqué).

## Le voile (composant `PageVeil`)
- `position: fixed`, pleine largeur, **au-dessus de tout** (z-index > header et >
  `PageTransitionOverlay` ? — non : le voile ne doit PAS masquer le morph ; il
  n'est monté que dans le cas « voile », donc pas de conflit de z avec le morph.
  z-index élevé, au-dessus du header).
- **Bande sombre haute** (hauteur ≈ 200 vh) avec **dégradé vertical** :
  `linear-gradient(to bottom, transparent 0%, #0a0a0a 20%, #0a0a0a 80%,
  transparent 100%)`. Le cœur opaque (20→80 % de 200 vh = 120 vh) couvre
  largement le viewport (100 vh) ; les 40 vh de dégradé en haut/bas donnent des
  bords doux. (Valeurs calibrées à l'implémentation.)
- **Mouvement** = balayage vertical ascendant, en deux phases enchaînées :
  - **IN (couvre)** : de « sous le viewport » à « cœur opaque centré sur le
    viewport ». `translateY` du bas vers le centre. ~0.45 s, easing douceur
    (ex. `[0.16,1,0.3,1]`).
  - **OUT (révèle)** : continue vers le haut jusqu'à sortir par le haut.
    ~0.45 s. Un seul geste ascendant façon rideau.
  - Les valeurs exactes de `translateY` (en vh) sont calibrées pour que le cœur
    opaque couvre 100 % du viewport à la fin de IN.
- Couleur : sombre neutre (`#0a0a0a`), cohérent avec le carousel. Theme-aware
  non nécessaire (le voile est volontairement sombre dans les deux thèmes).

## Coexistence morph & scroll
- **Morph carte→détail** et **reverse détail→liste** : inchangés, gérés par
  `PageTransitionOverlay`. Le voile est **supprimé** (swap immédiat) tant qu'un
  morph est actif → pas de double animation.
- **Scroll** : le reset « en haut » se fait au **moment du swap**
  (`displayedLocation` change), pas au changement de location (sinon on
  scrollerait la page encore visible). Adapter/retirer `ScrollToTop` en
  conséquence (le contrôleur de transition prend la responsabilité du reset ; la
  restauration de scroll spécifique à `/projets`, gérée dans `Projets.tsx`,
  reste prioritaire pour cette page).

## Reduced-motion
`prefers-reduced-motion: reduce` → jamais de voile : `displayedLocation` suit la
location immédiatement (comportement actuel).

## Composants & fichiers
- **Create** `src/app/components/PageVeil.tsx` — le voile (présentational :
  reçoit une phase `in`/`out` ou des variants + callbacks `onCovered`/`onDone`).
- **Create** `src/app/components/RouteTransition.tsx` (ou un hook
  `useRouteTransition`) — le contrôleur : gère `displayedLocation`, détecte
  morph/reduced-motion, orchestre voile IN → swap+scroll → voile OUT, et rend
  `<Routes location={displayedLocation}>` (les `<Route>` lui sont passés en
  enfants).
- **Modify** `src/app/App.tsx` — `AppContent` délègue le rendu des routes à
  `RouteTransition` ; ajuster `ScrollToTop`.
- **Modify** `src/app/components/ScrollToTop.tsx` (+ son test) si le reset de
  scroll migre vers le contrôleur.

## Accessibilité & perf
- Voile `aria-hidden` (décoratif), `pointer-events` désactivés pendant la
  transition pour ne pas bloquer, ou bloquer volontairement les clics le temps
  du swap (à trancher — défaut : bloquer les interactions pendant la couverture
  pour éviter les double-navigations).
- `prefers-reduced-motion` respecté.
- Budget ≤ 190 kB gzip. Pas de nouvelle dépendance (motion déjà là).

## Tests
- Le contrôleur rend la page de `displayedLocation`, pas de la location live,
  tant que le voile n'a pas couvert (pas de flash).
- Changement de route → voile joué ; `displayedLocation` swappe **après** la
  couverture.
- Morph projet actif → **pas** de voile (swap immédiat).
- `prefers-reduced-motion` → **pas** de voile (swap immédiat).
- Reset scroll au swap.

## Critères de réussite
- Toute navigation (Accueil↔Projets, ↔À propos, ↔Contact, etc.) joue le voile
  sombre à bords doux, plein écran, sans flash de la nouvelle page avant
  couverture. Le **morph projet** (aller/retour) fonctionne toujours, sans
  double transition. Reduced-motion = swap instantané. Scroll correct.
  `tsc` / Biome / build / tests / budget verts. Captures/vidéo relues.
