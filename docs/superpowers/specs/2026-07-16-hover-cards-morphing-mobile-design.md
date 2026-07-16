# Hover dynamique des cards et morphing mobile — Design

## Objectif

Améliorer deux interactions du portfolio sans modifier sa structure visuelle : rendre le contour lumineux des cards Projets sensible à la position du pointeur et au thème actif, puis remplacer la navigation mobile abrupte entre la liste et un détail par un morphing d’image fluide et réversible.

## État actuel et causes

- Le glow des cards repose sur deux pseudo-éléments fixes placés dans les angles supérieur gauche et inférieur droit. Leur couleur reste claire dans les deux thèmes et leur intensité ne dépend pas de la position du pointeur. Le résultat est peu visible en thème clair et uniforme sur les segments affichés.
- `NewProjectCard` ne déclenche la transition d’image qu’à partir de `1024px`.
- `PageTransitionOverlay` refuse également de s’afficher sous `1024px`. Sur mobile, le clic laisse donc React Router remplacer immédiatement la liste par le détail.
- Le gestionnaire `popstate` de `Projets` ne peut pas garantir une transition retour, car la page Projets n’est généralement pas montée au moment où l’utilisateur quitte le détail.

## 1. Hover dynamique des cards

### Composant BorderGlow

Le composant React Bits fourni sera intégré sous la forme d’un composant TypeScript local `BorderGlow`. Il restera présentational : il calcule la proximité du pointeur avec le bord et l’angle du pointeur par rapport au centre, puis expose ces valeurs avec des propriétés CSS personnalisées.

`NewProjectCard` conservera son unique lien accessible comme surface interactive complète. `BorderGlow` formera l’enveloppe décorative autour de ce lien, sans ajouter de bouton, de navigation ou de gestion de thème en JavaScript.

Le composant ne jouera pas le balayage d’introduction proposé par React Bits. Seule l’interaction au pointeur sera active.

### Rendu du contour

- Le masque conique sera centré sur la direction du pointeur.
- La portion du contour la plus proche du pointeur recevra l’intensité maximale.
- L’intensité diminuera progressivement dans les deux directions le long du contour jusqu’à une opacité nulle.
- Le cône restera étroit avec `coneSpread={12}` afin de ne jamais produire un halo uniforme autour de la card.
- La sensibilité au bord sera fixée à `6`, le rayon extérieur à `18px` et le remplissage coloré à `0` : seule la bordure sera éclairée.
- Le glow extérieur ne changera ni les dimensions de la card ni son occupation dans la mise en page.
- L’effet sera limité à `@media (hover: hover) and (pointer: fine)`.

Les couleurs seront pilotées uniquement par les tokens existants du thème :

- thème clair : anthracite `rgb(26 26 26)` avec des niveaux d’opacité de `70%`, `35%` et `12%` ;
- thème sombre : blanc cassé `rgb(234 234 234)` avec des niveaux d’opacité de `90%`, `45%` et `16%`.

Trois niveaux d’opacité du même ton alimenteront le mesh du contour. Aucun violet, rose, bleu ou autre accent du composant de démonstration React Bits ne sera introduit.

### Interactions préservées

- Le léger zoom de l’image reste contenu dans son wrapper `overflow-hidden`.
- Le survol de toute la card continue de déclencher `RollingText` pour « Voir le projet ».
- Le lien complet reste utilisable à la souris, au clavier et avec les clics modifiés.
- Le focus clavier garde un contour continu et visible dans les deux thèmes ; il ne dépend pas d’une ancienne position de pointeur.
- Avec `prefers-reduced-motion: reduce`, le zoom et les transitions animées sont neutralisés. Le focus reste visible.

## 2. Morphing mobile liste ↔ détail

### Architecture

Le mécanisme existant sera conservé et clarifié autour de trois responsabilités :

1. `NewProjectCard` capture la géométrie de l’image, le projet cible, la route d’origine et la position de scroll, puis demande une transition avant de naviguer.
2. `PageTransitionContext` conserve un snapshot de transition réutilisable pour l’aller et, uniquement lorsque l’origine est `/projets`, pour le retour.
3. `PageTransitionOverlay` anime l’image au-dessus des deux routes pendant leur remplacement.

Le snapshot contiendra : la source de l’image, le rectangle de départ, le lien du projet, la route d’origine, la position de scroll et la direction de l’animation. Une navigation vers une route sans rapport effacera ce snapshot afin d’empêcher une animation tardive avec des données périmées.

### Aller vers un détail

- Les clics primaires sans modificateur déclencheront le morphing sur mobile comme sur desktop lorsque l’image et son rectangle sont disponibles.
- Le comportement desktop existant restera inchangé.
- Sur mobile, l’image passera du rectangle de la card au hero plein viewport avec une courbe douce de type `[0.76, 0, 0.24, 1]`.
- Le morphing durera `650ms`. La navigation aura lieu à `420ms`, pendant que l’image recouvre encore l’écran, puis l’overlay s’effacera sur le hero réel avant `800ms`.
- Le rayon de 8 px convergera vers 0 px sans redimensionner la card d’origine.

### Retour vers Projets

- Le retour par l’historique ou par un lien vers `/projets` utilisera le snapshot seulement si la navigation initiale venait de la liste Projets.
- La position de scroll de la liste sera restaurée avant le calcul du rectangle cible.
- Après le montage de `Projets`, le rectangle courant de l’image cible sera mesuré dans un layout effect.
- L’overlay partira du hero plein écran et se réduira vers la card correspondante en `600ms`.
- Une fois l’animation terminée, le snapshot sera supprimé.

Si le projet ou le rectangle cible ne peut pas être retrouvé, la page Projets apparaîtra avec un fondu de `200ms`. La navigation ne sera jamais bloquée par l’absence d’une cible d’animation.

### Navigation native et mouvement réduit

- Les clics avec Ctrl, Cmd, Shift ou Alt, les clics non primaires et les liens avec `target="_blank"` ne seront pas interceptés.
- Sans image exploitable, le lien naviguera immédiatement.
- Avec `prefers-reduced-motion: reduce`, le lien naviguera immédiatement, sans délai, morphing ou restauration visuelle animée.
- L’overlay restera `pointer-events: none` et ne pourra pas bloquer l’interface.

## 3. Tests et validation

Les changements seront développés en TDD avec Vitest et Testing Library.

Tests automatisés attendus :

- calcul et mise à jour des variables de direction et de proximité de `BorderGlow` ;
- absence de navigation ou de rôle interactif supplémentaire autour du lien de card ;
- activation persistante de « Voir le projet » au hover et au focus ;
- conservation des clics modifiés natifs ;
- démarrage du morphing et navigation différée sur mobile ;
- navigation immédiate lorsque le mouvement réduit est demandé ;
- conservation du snapshot aller puis consommation et nettoyage au retour ;
- restauration du scroll uniquement pour un retour vers la route d’origine ;
- rendu de l’overlay avec les configurations desktop, mobile, aller et retour.

Validation manuelle :

- thèmes clair et sombre à `1440 × 900` avec le pointeur près des quatre bords et au centre de la card ;
- focus clavier visible sans souris ;
- mobile à `390 × 844` pour l’aller, le retour navigateur et le retour via le menu ;
- absence de scroll ou de décalage de mise en page créé par le glow ;
- test avec `prefers-reduced-motion` activé ;
- build de production, suite Vitest complète et `npm audit`.

## Hors périmètre

- Refonte visuelle des cards, de leur typographie ou de leur mise en page.
- Modification des animations de contenu internes aux pages projet.
- Ajout d’une palette colorée issue de la démonstration React Bits.
- Remplacement général de React Router ou de Motion.
