# Corrections mobile et interactions — Spécification de conception

## Contexte

Le portfolio est une SPA React 18 construite avec Vite, Tailwind CSS 4, Motion et GSAP. Le fond animé de l’accueil est rendu en WebGL par `Grainient`. Le document `html` est fixe et `body` constitue le conteneur de scroll. Les changements doivent donc rester ciblés afin de ne pas perturber les pages longues, les transitions entre projets ni l’identité monochrome du site.

Le dépôt contient déjà des modifications non commitées qui ajoutent Vercel Analytics et Speed Insights dans `package.json`, `package-lock.json` et `src/app/App.tsx`. Elles appartiennent à l’utilisateur et doivent être conservées.

## Diagnostic de l’existant

1. L’accueil utilise `100vh` à plusieurs niveaux et le viewport HTML n’active pas `viewport-fit=cover`. Safari iPhone ne peut donc pas étendre correctement le fond sous les zones système ni suivre précisément la hauteur visible lorsque ses barres changent de taille.
2. `body` reste un conteneur de scroll sur l’accueil alors que cette page ne possède qu’un hero plein écran. Cela entretient un scroll ou un rebond inutile sur mobile.
3. `ScrollFadeIn` attend que 30 % d’une card soit visible et `Projets` ajoute un délai croissant selon son index. Les cards suivantes restent ainsi masquées trop longtemps.
4. `AppContent` mémorise que le site a initialement affiché le splash et transmet cette valeur permanente à chaque nouveau montage de `Home`. Après un aller-retour depuis une autre page, le hero attend encore 2,8 secondes avant de commencer à apparaître. La reproduction automatisée confirme une opacité nulle jusqu’à environ 2,8 secondes.
5. `Shuffle` masque chaque caractère avec `overflow: hidden`. La marge de sécurité fixe de 4 px devient insuffisante pour les grands glyphes, particulièrement le « O » de `PRODUCT` sur desktop.
6. `NewProjectCard` n’est pas elle-même interactive : seul son bouton déclenche la navigation. Son état de hover est également limité au bouton. Le `ref` transmis par `Projets` n’est pas attaché à l’image, alors que la transition inverse essaie de le lire.
7. Le header partage déjà un état `hoveredItem`, mais seuls `projets` et `apropos` l’alimentent. Le bouton de contact et le sélecteur de thème restent groupés et ne peuvent pas devenir individuellement l’élément actif.

## Objectifs

- Afficher un accueil réellement plein écran sur Safari iPhone, fond compris sous la barre de statut, sans scroll vertical utile.
- Conserver les contrôles importants dans la safe area et le comportement responsive existant ailleurs.
- Faire apparaître le titre rapidement après chaque retour sur l’accueil, tout en conservant son fondu flouté et l’animation `Shuffle`.
- Déclencher plus tôt les cards de projets sans rendre leur entrée brusque.
- Rendre toute la card cliquable, animée et accessible au clavier.
- Ajouter un éclairage partiel du contour et un zoom d’image discret uniquement sur les appareils capables de hover.
- Étendre exactement le comportement d’atténuation du menu au contact et au thème.
- Ajouter des tests de régression avec Vitest et Testing Library.

## Hors périmètre

- Refonte du header, de la grille de projets, de la typographie ou des couleurs de marque.
- Remplacement de Motion, GSAP, `Grainient` ou React Router.
- Modification des durées de la transition plein écran entre une card et la fiche projet.
- Changement des contenus, images ou données des projets.
- Déploiement ou publication distante.

## Conception retenue

### 1. Accueil plein écran et safe areas

Le viewport HTML recevra `viewport-fit=cover`. Le fond restera plein écran et pourra occuper les zones situées derrière la barre de statut et l’indicateur d’accueil.

La hauteur de `.home-section`, de son hero et du wrapper WebGL utilisera une cascade de compatibilité : `100vh` comme fallback, puis `100dvh` dans les navigateurs modernes. Le hero utilisera la hauteur de son parent plutôt qu’une seconde déclaration Tailwind `h-screen`, afin qu’une seule source détermine sa géométrie.

Pendant le montage de `Home`, une classe de route dédiée sera ajoutée à `body` pour désactiver son scroll vertical. Le nettoyage du composant retirera cette classe lorsque l’utilisateur quitte l’accueil, de sorte que les autres pages retrouvent leur scroll actuel.

Le header continuera visuellement à 2 rem du bord sur les écrans sans encoche. Avec une safe area, son espacement supérieur deviendra le maximum entre cette valeur et `safe-area-inset-top + 1rem`. Le CTA mobile conservera son placement actuel tant que celui-ci est déjà sûr ; son `bottom` intégrera `safe-area-inset-bottom` seulement lorsque l’inset exige davantage d’espace.

Le fond et le canvas ne recevront aucun padding de safe area : eux seuls doivent rester full bleed. Les dimensions de rendu de `Grainient` seront dérivées de son conteneur pour éviter un décalage entre le canvas et la hauteur dynamique.

### 2. Apparition anticipée des cards

`ScrollFadeIn` acceptera deux options supplémentaires compatibles avec ses usages actuels : le seuil visible (`amount`) et la marge d’observation (`margin`). Les valeurs par défaut resteront celles de l’existant afin de ne pas modifier les autres pages.

Sur la liste principale de `Projets`, les cards utiliseront un seuil proche de 15 % et une marge basse positive proche de 10 % du viewport. Leur délai sera plafonné à 100 ms au lieu d’augmenter continuellement avec l’index. La durée et la courbe d’accélération actuelles seront conservées pour garder la même sensation de fluidité.

Lorsque `prefers-reduced-motion: reduce` est actif, `ScrollFadeIn` affichera directement le contenu, sans translation ni flou.

### 3. Réapparition du titre et masque des glyphes

`Home` recevra l’état réel et courant du splash, non une valeur mémorisée au premier chargement. Une navigation ultérieure vers `/` utilisera donc le délai court. Sans splash actif, le fondu commencera environ 100 ms après le montage ; l’animation elle-même restera présente.

Au premier chargement, le hero restera synchronisé avec la sortie du splash : il commencera à se révéler pendant la fin du rideau et sera lisible dès que celui-ci libère l’écran.

Le masque construit par `Shuffle` recevra une marge intérieure horizontale proportionnelle à la taille mesurée du caractère, bornée pour rester discrète. Une marge extérieure négative compensera exactement cet espace supplémentaire. Le masque gagnera ainsi de la place pour l’anticrénelage et les débords du glyphe sans élargir visuellement le mot ni changer son crénage. Le mécanisme sera appliqué à tous les caractères plutôt qu’à un « O » codé en dur.

### 4. Hover et navigation des cards

L’élément racine de `NewProjectCard` deviendra un `Link` React Router. Le bouton intérieur deviendra une présentation non interactive du CTA, ce qui évitera les éléments interactifs imbriqués. Le clic, le toucher et la touche Entrée suivront tous le même lien.

Sur desktop, le gestionnaire de clic existant continuera à intercepter la navigation lorsque l’image et son conteneur sont disponibles, à enregistrer le rectangle et à lancer la transition avant `navigate(link)`. Sur mobile et tablette, le lien naviguera directement comme aujourd’hui. Le `ref` reçu sera attaché à l’image afin que la transition inverse puisse retrouver sa position.

Le hover et le focus de la card piloteront un état interactif commun. Cet état :

- déclenchera `RollingText` pour « Voir le projet » ;
- fera passer l’image à une échelle maximale de 1,025 dans son conteneur `overflow: hidden` ;
- révélera deux segments lumineux, l’un près du coin supérieur gauche et l’autre près du coin inférieur droit ;
- ne modifiera ni les dimensions, ni le padding, ni la position de la card.

Les segments reprendront les tons neutres du thème via des variables CSS clair/sombre. Ils seront réalisés par pseudo-éléments et resteront localisés : aucun `box-shadow` uniforme ne ceinturera la card.

Le hover visuel sera limité à `@media (hover: hover) and (pointer: fine)`. Le focus clavier restera disponible sur tous les appareils avec un contour visible et cohérent. Sous `prefers-reduced-motion`, le zoom sera supprimé et les changements d’état deviendront quasi instantanés, sans supprimer l’indication de focus.

### 5. Hover du menu

Les identifiants du menu deviendront `projets`, `apropos`, `contact` et `theme`. Chaque élément calculera son opacité indépendamment : 1 lorsqu’aucun élément n’est actif ou lorsqu’il est lui-même actif, 0,4 lorsqu’un autre élément est actif.

Le bouton de contact conservera son état propre pour `RollingText`, mais alimentera aussi `hoveredItem`. Le sélecteur de thème sera enveloppé par une zone qui alimente le même état sans écraser son hover interne. Le délai actuel de 150 ms avant remise à zéro sera conservé pour permettre le passage fluide entre deux éléments voisins.

Le focus clavier appliquera le même principe sans empêcher l’activation des liens et boutons.

## Architecture des fichiers

- `index.html` : extension du viewport aux safe areas.
- `src/app/App.tsx` : transmission de l’état réel du splash à la route d’accueil, en préservant les ajouts Vercel existants.
- `src/app/pages/Home.tsx` : verrouillage scoped du scroll, hauteur héritée du hero, délai court et position sûre du CTA.
- `src/app/pages/Projets.tsx` : paramètres anticipés de révélation et délais plafonnés.
- `src/app/components/ScrollFadeIn.tsx` : options d’observation et réduction de mouvement.
- `src/app/components/Shuffle.tsx` : marge de masque compensée autour des glyphes.
- `src/app/components/common/NewProjectCard.tsx` : lien racine, état hover/focus global, transition conservée et `ref` d’image.
- `src/app/components/Header.tsx` : quatre cibles de hover/focus indépendantes.
- `src/app/components/Grainient.tsx` : dimensionnement du canvas depuis son conteneur dynamique.
- `src/styles/theme.css` : hauteurs dynamiques, safe areas et variables de thème.
- `src/styles/portfolio.css` : effets strictement scoped des cards et gestion de `prefers-reduced-motion`.
- `vite.config.ts`, `package.json`, `package-lock.json` : configuration Vitest/jsdom et dépendances de développement, sans retirer Analytics ou Speed Insights.
- `src/test/setup.ts` et tests colocalisés `*.test.tsx` : environnement DOM et régressions des composants.

## Stratégie de tests

Vitest sera configuré avec jsdom, Testing Library, `@testing-library/user-event` et les matchers DOM.

Les tests automatisés couvriront :

1. le délai court retourné par la configuration du hero lorsque le splash n’est plus actif ;
2. l’ajout et le nettoyage de la classe de verrouillage du scroll de l’accueil ;
3. les options `amount` et `margin` passées à `useInView`, ainsi que le rendu direct en mouvement réduit ;
4. la présence d’un lien racine unique sur une card et l’absence de bouton imbriqué ;
5. l’activation de `RollingText` au hover et au focus de la card ;
6. la navigation directe mobile et le déclenchement de transition desktop ;
7. les quatre états de hover/focus du header et l’atténuation des autres éléments ;
8. le calcul compensé de la marge du masque de caractères.

La validation finale comprendra `npm test -- --run`, `npm run build`, puis des scénarios navigateur sur 390 × 844, 768 × 1024, 1024 × 768 et 1440 × 900. Les contrôles porteront sur la hauteur et le scroll de l’accueil, le retour vers `/`, le seuil d’apparition des cards, leurs hover/focus/clics, les deux thèmes et le menu. Safari iPhone sera validé par les primitives WebKit (`viewport-fit`, `dvh`, `env`) et par une vérification des dimensions du viewport ; l’environnement Windows ne permet pas d’exécuter le simulateur iOS natif.

## Critères d’acceptation

- À 390 × 844, l’accueil a exactement la hauteur visible et `body.scrollHeight` ne dépasse pas `body.clientHeight`.
- Le fond touche les quatre bords du viewport, tandis que le header et le CTA restent dans la safe area.
- Après un retour depuis `/projets`, le hero commence à apparaître en moins de 200 ms.
- Le « O » de `PRODUCT` ne présente plus de coupe latérale aux largeurs desktop testées.
- Une card commence son apparition avant d’atteindre 30 % de visibilité et atteint son état final avec la courbe actuelle.
- Le hover d’une card n’entraîne aucun changement de sa boîte ou de la position des cards voisines.
- Toute la card est cliquable et activable avec Entrée ; son focus est visible.
- Le CTA animé réagit au hover et au focus de toute la card.
- Le contour lumineux reste limité à deux zones et l’image reste coupée par son cadre pendant le zoom.
- Pour chacune des quatre cibles du header, seule la cible active conserve une opacité de 1.
- Les nouveaux mouvements sont supprimés ou neutralisés sous `prefers-reduced-motion`.
- Les tests et le build terminent avec un code de sortie nul.
