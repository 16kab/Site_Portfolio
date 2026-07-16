# Correctif Safari et titre mobile

## Constat

Le padding ajouté aux masques de caractères de `Shuffle` pour éviter la coupure du « o » desktop est actuellement global. Sur mobile, il découvre une partie du caractère dupliqué pendant l’animation, ce qui crée l’artefact visible après `PRODUCT`.

Dans Safari classique sur iPhone, la barre d’état appartient au chrome du navigateur et ne peut pas afficher directement le canvas WebGL. Le site peut toutefois harmoniser cette zone avec le thème, étendre sa couche visuelle dans le plus grand viewport exposé par WebKit et activer le rendu translucide quand il est lancé depuis l’écran d’accueil.

## Solution retenue

### Typographie

`Shuffle` recevra une option explicite `useCharacterMaskPadding`, désactivée par défaut. Sans cette option, les marges et paddings des masques retrouveront exactement leurs valeurs historiques à zéro. Seul le `PRODUCT` de la composition desktop activera le padding anti-clipping. Les deux titres `Shuffle` mobiles et `DESIGNER` desktop resteront inchangés.

### Safari et iPhone

Le document ajoutera une balise `theme-color`, initialisée avant React avec une couleur cohérente avec le thème actif. Un synchroniseur léger mettra ensuite cette couleur à jour lorsque la classe `dark` change.

Les métadonnées Apple activeront le mode web app et le style `black-translucent` pour un lancement depuis l’écran d’accueil. Elles n’essaieront pas de masquer les contrôles Safari classique.

La couche `.grainient-wrapper` utilisera `100lvh` pour couvrir le plus grand viewport que Safari expose, avec `100vh` comme fallback et `100dvh` comme hauteur minimale. La section de contenu et le verrouillage du scroll resteront en `100dvh`, afin de ne pas réintroduire de scroll vertical.

## Validation

- Test unitaire du padding désactivé par défaut et activé explicitement.
- Test du synchroniseur de couleur Safari pour les thèmes clair et sombre.
- Vérification des métadonnées Apple et viewport dans `index.html`.
- Suite Vitest complète, build Vite et `git diff --check`.
- Contrôle navigateur aux formats 390 × 844 et 1440 × 900 pour confirmer l’absence d’artefact mobile et de régression desktop.

