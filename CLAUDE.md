# CLAUDE.md — Portfolio « Le Salon »

Ce fichier décrit le projet en entier : concept, direction artistique, expérience, architecture technique et feuille de route. Lis-le en entier avant toute tâche. En cas de doute sur un choix, la priorité est toujours : **1. l'ambiance et l'identité visuelle, 2. la fluidité (60 fps), 3. la légèreté**.

---

## 1. Vision

Le portfolio est un **mini jeu vidéo**. Le visiteur est en **vue subjective (POV)** : il incarne un homme assis sur son canapé, dans un salon sombre, face à une **télé cathodique vintage**. Il voit la télé devant lui et sa propre main tenant une télécommande.

- **Chaque chaîne de la télé = un projet du portfolio.**
- On zappe avec le clavier, la main appuie réellement sur les boutons de la télécommande.
- Pour ouvrir un projet, on est **aspiré dans l'écran**. Pour en sortir, on est **recraché sur le canapé**.
- Le salon est vivant : lumière de la télé qui danse sur les murs, chat qui se promène, sons du quotidien.

L'identité visuelle doit être **extrêmement marquée et singulière**, dans l'esprit de *No Rest for the Wicked* (Moon Studios) : un rendu **peinture à l'huile**, pas du photoréalisme.

Cible : **desktop uniquement** pour la V1 (clavier + souris). Le mobile viendra en V2 : même expérience, en mode paysage obligatoire (voir §13).

---

## 2. Direction artistique

### 2.0 Référence principale : *No Rest for the Wicked*
*No Rest for the Wicked* (Moon Studios) est **la** référence de la DA : en cas de doute sur un choix visuel, on se demande « est-ce que ça pourrait être une image du jeu ? ». Ce qu'on en retient :
- **la peinture se voit** : coups de pinceau épais et orientés (impasto), bords cassés, jamais de rendu lisse ou « 3D propre » ;
- des **surfaces peintes à la main** (textures faites de touches de pinceau, pas de bruit ni de photo) ;
- une image **sombre et contrastée** : grandes masses d'ombre, la lumière ne sculpte que ce qui compte ;
- des **ombres froides** (bleu nuit, violet) et des **lumières chaudes et saturées**, une palette terreuse et un peu désaturée entre les deux ;
- des formes **massives et lisibles**, aux silhouettes fortes, avec des raccords propres (pas de géométrie qui « flotte » ou s'interpénètre visiblement).

### 2.1 Rendu « peinture à l'huile »
- Toute la scène 3D passe par un **filtre peinture en post-process** (filtre de Kuwahara anisotrope ou généralisé), qui transforme les formes en coups de pinceau.
- Par-dessus, une passe de **coups de pinceau visibles** qui suivent l'orientation des formes, avec un léger relief (impasto) qui accroche la lumière, et des **bords cassés**.
- Les matériaux portent des **textures de touches de pinceau** générées en code.
- Ajouter une légère **texture de toile** (grain de canevas) en overlay, et un très léger grain animé.
- **L'écran de la télé est exclu du filtre peinture** : il reste net, seulement traité avec l'effet CRT (§2.3). Le contraste « salon peint / écran net » est central dans la DA : la télé doit être hypnotique.

### 2.2 Lumière : clair-obscur
- Salon **sombre**, éclairage façon Caravage : de grandes zones d'ombre, peu de sources.
- **Source principale : la télé.** Lumière froide (bleutée), vacillante, et surtout **colorée par le contenu affiché** : quand la chaîne change, la couleur dominante de la vidéo se reflète sur les murs, le canapé, la main, le chat.
- **Source secondaire : une lampe** à abat-jour, chaude et faible, à gauche. Elle crée le contraste chaud/froid.
- Lumière de la ville qui filtre par la fenêtre (froide, très faible, éventuellement des phares de voiture qui balaient le plafond de temps en temps).

### 2.3 L'écran CRT
Shader appliqué à la texture de l'écran :
- courbure (barrel distortion) et vignettage dans les coins ;
- lignes de balayage (scanlines) et masque de phosphore discret ;
- légère aberration chromatique ;
- bruit/neige animé, plus fort pendant les transitions de chaîne ;
- léger « bloom » des zones claires (fait dans le shader, pas en post-process global pour ne pas casser le rendu peinture) ;
- reflet de la pièce sur la vitre bombée (très subtil).

### 2.4 Formes et objets
- Formes **trapues, exagérées, caricaturales** : grosse télé bombée, main épaisse, chat un peu cartoon. On cherche du caractère, pas de la précision.
- Géométrie volontairement simple (le filtre peinture la sublime). Peu de détails fins : ils se perdent dans le filtre.

### 2.5 Palette
- Ombres : bruns profonds, violets sombres, bleu nuit (jamais du noir pur).
- Lumière télé : bleu-cyan froid, puis teintée par la vidéo.
- Lampe : ocre, ambre.
- Bois de la télé : brun chaud.
- Peau de la main : tons chauds légèrement désaturés.

### 2.6 Interface
- **Aucune interface web classique** sur l'écran principal. Toute l'information passe par la télé elle-même (OSD de la télé : numéro de chaîne, barre de volume vert phosphore en police monospace pixel, style années 80-90).
- Une aide discrète des touches clavier peut apparaître les premières secondes puis disparaître (style « notice » posée sur la table basse, ou OSD de la télé).

---

## 3. La scène

Contenu du salon (tout construit en code dans Three.js, voir §6.4) :

| Élément | Détails |
|---|---|
| Télé cathodique | Caisson bois, écran bombé, deux boutons rotatifs, grille de haut-parleur, antenne « oreilles de lapin ». Posée sur un meuble bas. |
| Télécommande | Dans la main droite, au premier plan en bas à droite. Boutons : CH+, CH−, VOL+, VOL−, Power (rouge), pavé numérique. Les boutons s'enfoncent physiquement. |
| Main | Main droite qui tient la télécommande. Le pouce bouge pour appuyer sur les boutons. |
| Canapé | Accoudoirs visibles sur les bords bas de l'écran, genoux/jambes floues au premier plan. |
| Lampe | À gauche, abat-jour, lumière chaude. |
| Fenêtre | À droite, rideaux, lumières de la ville floues. |
| Chat | Se promène dans la pièce (voir §4.8). |
| Décor | Table basse (avec éventuellement une tasse, la notice des touches), tapis, cadres au mur, plante. Pas trop chargé. |

Caméra : position fixe à hauteur des yeux d'une personne assise. Seule la rotation de tête bouge (§5.2).

---

## 4. Déroulé de l'expérience

### 4.1 Chargement
- Écran noir avec une **barre de chargement** stylisée (dans la DA : par exemple une barre en peinture ou une barre OSD verte de télé).
- On précharge **tout ce qui est nécessaire à la fluidité** : la scène, les shaders compilés, tous les sons, et les **boucles courtes** de chaque chaîne.
- Les vidéos complètes des projets ne sont **pas** préchargées (§7.3).
- Précompiler les shaders (`renderer.compile`) et faire un rendu à blanc avant de lancer l'intro, pour éviter tout à-coup.
- Le site démarre au clic (nécessaire pour débloquer l'audio dans les navigateurs) : « Cliquez pour ouvrir les yeux » ou équivalent.

### 4.2 Intro : le réveil
1. Noir complet. Une respiration, un bâillement léger.
2. **Les yeux s'ouvrent** : masque de paupières (deux bords qui s'écartent), flou qui se dissipe, un ou deux clignements.
3. **La lampe s'allume en clignotant** (néon/ampoule capricieuse : 2-3 flashs irréguliers puis stabilisation), avec le son du clic d'interrupteur et le grésillement de l'ampoule.
4. **La télé s'allume** : point blanc au centre qui s'étire en ligne horizontale puis s'ouvre en image (allumage CRT classique), son de « thump » haute tension + sifflement aigu, puis neige, puis la chaîne 1.
5. La main avec la télécommande remonte dans le champ.
6. Le contrôle est rendu au joueur. Aide des touches affichée quelques secondes.

Durée totale cible : 6 à 8 secondes.

### 4.3 Zapper (changer de chaîne)
- CH+ / CH− : la main appuie sur le bouton correspondant (animation du pouce + enfoncement du bouton + clic sonore).
- Transition de chaîne : **neige + grésillement** très court (150-300 ms), petite déformation verticale de l'image (perte de synchro), puis la nouvelle chaîne.
- OSD : le numéro de chaîne s'affiche en haut à gauche de l'écran télé (« CH 03 ») avec le **nom du projet**, puis disparaît après 2-3 s.
- Chaque chaîne affiche en boucle un **extrait court** du projet (vidéo).
- La couleur de la lumière de la télé change immédiatement (§6.3).
- Le pavé numérique permet d'aller directement à une chaîne (taper « 3 » = chaîne 3).
- La liste des chaînes boucle (après la dernière, on revient à la première).

### 4.4 Easter egg : zapping frénétique
- Si le joueur zappe très vite (ex. plus de 8 changements en moins de 4 secondes), la main s'emballe (animation de plus en plus nerveuse).
- Au-delà d'un seuil (ex. 20 changements rapides), **la télé commence à fumer** : particules de fumée qui sortent de l'arrière/du dessus du caisson, image qui se dégrade (plus de neige, couleurs qui bavent, image qui se rétrécit), petits crépitements.
- Si on insiste, la télé **s'éteint toute seule** (« pfiou »), il faut la rallumer avec Power. La fumée se dissipe lentement.
- Si on arrête de zapper, tout revient à la normale progressivement.

### 4.5 Entrer dans un projet : l'aspiration
Touche Entrée sur une chaîne :
1. Léger **tremblement de caméra** qui monte en intensité.
2. La tête se recentre automatiquement sur la télé.
3. **Zoom brutal et accéléré** vers l'écran (avec FOV qui s'élargit, effet de vitesse, aberration chromatique qui augmente, le salon s'étire).
4. On traverse la vitre de l'écran : flash blanc / distorsion CRT maximale.
5. On arrive dans la **page projet** (§4.6).

Son : aspiration (« woosh » montant) + saturation électrique. Durée : environ 1,2 s.

### 4.6 La page projet (« dans la télé »)
Le visiteur est maintenant « dans » la télé. La page garde l'**habillage de la télé** pour rester dans la DA :
- Cadre CRT léger autour de tout le contenu (courbure, scanlines discrètes, grain).
- OSD permanent en haut à gauche : numéro de chaîne + nom du projet.
- **Contenu principal : une vidéo du projet**, plein cadre, en lecture automatique (montage réalisé avec l'auteur pour chaque projet).
- Sous la vidéo (ou après, au défilement) : le contenu texte et images du projet (contexte, rôle, outils, liens), toujours avec le traitement CRT.
- Indication discrète pour sortir : « ÉCHAP — retour au canapé ».
- Le design exact de cette page est encore ouvert : rester simple et cohérent avec l'OSD télé, proposer des variantes à l'auteur.

### 4.7 Sortir d'un projet : l'éjection
Touche Échap (ou Retour arrière) :
1. Distorsion CRT inversée, on est **recraché** hors de l'écran (dézoom violent).
2. **Impact sur le canapé** : la caméra part en arrière et vers le haut, on voit **les pieds/les jambes qui se soulèvent** dans le champ, comme si on était projeté dans les coussins.
3. Rebond, petit tremblement, la caméra se stabilise. Son de chute dans les coussins (« pouf ») + ressorts du canapé.
4. On retrouve la chaîne du projet qu'on vient de quitter.

### 4.8 Le chat
- Un chat se promène dans la pièce **de temps en temps** (pas en permanence) : traverse devant le meuble télé, s'assoit, se lèche, repart.
- Parfois il passe **devant l'écran** et masque partiellement la télé (sa silhouette se découpe dans la lumière).
- Petits sons occasionnels (miaulement discret, ronronnement s'il passe près).
- Easter egg possible : s'il reste longtemps devant la télé, regarder vers lui (souris) le fait réagir.

### 4.9 Éteindre la télé (Power)
- Extinction CRT classique : l'image se contracte en ligne puis en point lumineux qui s'éteint lentement.
- La pièce tombe dans une **pénombre** (seulement la lampe et la fenêtre).
- L'**ambiance sonore de la pièce** (§8) joue **en permanence, télé allumée comme éteinte**. Quand la télé s'éteint, plus rien ne la couvre : elle ressort nettement, pas angoissante mais présente, intime :
  - rumeur de la ville dehors (voitures au loin, une sirène lointaine de temps en temps) ;
  - **voisins qui se disputent, très étouffés** à travers le mur ;
  - frigo qui ronronne, horloge, plancher qui craque ;
  - le chat qui ronronne s'il est proche.
- Rallumer avec Power : allumage CRT (§4.2 étape 4) et retour à la dernière chaîne.

### 4.10 Volume
- VOL+ / VOL− : la main appuie, l'OSD affiche une **barre de volume verte** sur l'écran de la télé.
- Le volume contrôle le son de la télé (vidéos, grésillements), pas l'ambiance de la pièce.
- Volume à 0 : icône « muet » sur l'OSD.

### 4.11 Inactivité (optionnel)
- Après un long moment sans action : la tête dodeline, les paupières se ferment à moitié, la télé passe en mire de fin d'émission. Le moindre mouvement réveille.

---

## 5. Contrôles

### 5.1 Clavier (tout se joue au clavier)
| Touche | Action | Bouton de la télécommande |
|---|---|---|
| ↑ / → | Chaîne suivante | CH+ |
| ↓ / ← | Chaîne précédente | CH− |
| 1 à 9 | Aller directement à la chaîne | Pavé numérique |
| Entrée / Espace | Entrer dans le projet | — |
| Échap / Retour arrière | Sortir du projet | — |
| + / − (et pavé num.) | Volume | VOL+ / VOL− |
| P | Allumer / éteindre la télé | Power |
| M | Muet | Mute |

Règles :
- Chaque action déclenche l'animation de la main sur le **bon bouton** de la télécommande.
- Les actions s'enchaînent sans jamais bloquer : si une animation est en cours, la suivante prend le relais proprement (file d'attente courte ou interruption fluide).
- Désactiver les touches non pertinentes selon l'état (ex. pas de zapping télé éteinte, pas d'Entrée pendant une transition).

### 5.2 Souris = la tête
- La souris **ne sert pas à cliquer** dans le salon : elle contrôle **l'orientation de la tête**.
- Amplitude maximale : environ **±20° horizontalement** et **±10° verticalement**.
- Position de la souris normalisée sur la fenêtre (centre = regard droit sur la télé).
- **Inertie / amortissement** (interpolation douce, type ressort) pour donner la sensation d'une vraie tête, jamais d'une caméra rigide.
- Micro-mouvements de respiration permanents (très légers).
- Quand la souris sort de la fenêtre, la tête revient doucement au centre.
- Pas de pointer lock.

### 5.3 Mode tactile de test (prototype seulement)
Pour pouvoir tester la DA sur téléphone pendant le développement :
- Tête pilotée par le **gyroscope** (DeviceOrientation, avec demande de permission sur iOS).
- Boutons à l'écran qui reproduisent la télécommande.
- Ce mode préfigure la version mobile (§13) mais n'est pas finalisé en V1.

---

## 6. Architecture technique

### 6.1 Stack
- **Vite** + **TypeScript**.
- **Three.js** (vanilla, pas de React Three Fiber) pour la 3D.
- **GSAP** pour les timelines d'animation (intro, transitions, caméra).
- **Howler.js** pour l'audio (sprites, fondus, volume par groupe).
- Shaders GLSL écrits à la main (post-process peinture, CRT, effets de transition).
- Pas de framework UI lourd. La page projet peut être en HTML/CSS avec un overlay WebGL ou un canvas pour l'effet CRT.

### 6.2 Structure du projet
```
/src
  main.ts                 point d'entrée
  /core
    App.ts                boucle principale, resize, horloge
    StateMachine.ts       états de l'expérience (§6.5)
    Input.ts              clavier, souris, gyroscope
    Loader.ts             préchargement + barre de progression
    Audio.ts              sons et ambiances (Howler)
  /scene
    Room.ts               murs, sol, fenêtre, décor
    Tv.ts                 caisson, écran, boutons, antenne
    Remote.ts             télécommande + boutons animés
    Hand.ts               main + animations du pouce
    Sofa.ts               accoudoirs, jambes/pieds
    Lamp.ts               lampe + clignotement
    Cat.ts                chat + comportement
    Smoke.ts              particules de fumée
    Lighting.ts           lumières, couleur dynamique de la télé
    HeadCamera.ts         caméra, rotation de tête, tremblements
  /render
    Composer.ts           pipeline de post-process
    PaintPass.ts          filtre peinture (Kuwahara)
    CrtMaterial.ts        shader de l'écran
    TransitionPass.ts     aspiration / éjection / réveil (paupières)
  /channels
    ChannelManager.ts     liste des chaînes, zapping, vidéos
    projects.json         données des projets (§7.1)
  /project
    ProjectPage.ts        page projet « dans la télé »
  /shaders                fichiers .glsl
/public
  /video                  boucles courtes + vidéos complètes
  /audio                  sons
  /textures               canevas, bruit (petites, compressées)
```

### 6.3 Pipeline de rendu
1. **Rendu de l'écran télé** : la vidéo de la chaîne courante en `VideoTexture`, passée dans le shader CRT, appliquée au mesh de l'écran.
2. **Rendu de la scène** dans un render target.
3. **Masque de l'écran** : rendre l'écran seul dans un buffer de masque (ou utiliser le stencil) pour savoir quels pixels exclure du filtre peinture.
4. **Passe peinture (Kuwahara)** sur la scène, **sauf** là où le masque indique l'écran. Calculée en **demi-résolution** puis upscalée si nécessaire pour la performance.
5. **Composition** : scène peinte + écran net + texture de toile + grain + vignettage.
6. **Passe de transition** (paupières, aspiration, éjection) par-dessus quand c'est actif.

**Lumière dynamique de la télé** : toutes les ~100 ms, dessiner la frame vidéo courante dans un petit canvas (ex. 8×8 px), calculer la couleur moyenne, et l'appliquer (lissée) à la lumière de la télé (RectAreaLight ou PointLight devant l'écran). Ajouter un scintillement léger.

### 6.4 Construction de la scène
- **Tout est construit en code** (primitives Three.js, `ExtrudeGeometry`, `LatheGeometry`, géométries personnalisées) : l'auteur ne fait pas de 3D.
- Formes simples et exagérées, le filtre peinture fait le reste.
- Prévoir qu'**un objet puisse être remplacé plus tard par un modèle GLB** (ex. la main ou le chat téléchargés sur Sketchfab) : chaque objet est un module isolé avec la même interface (position, animation), le remplacement ne doit pas toucher au reste.
- Ombres : éclairage précalculé si possible (lightmaps générées ou ombres « peintes » dans les matériaux), ombres temps réel uniquement pour la lumière de la télé et en basse résolution.
- Textures procédurales (bruit, motifs) générées en shader plutôt que des images lourdes.

### 6.5 Machine à états
États principaux et transitions autorisées :
```
LOADING → WAITING_CLICK → INTRO → TV_ON
TV_ON ⇄ ZAPPING (transitoire)
TV_ON → ENTERING → IN_PROJECT → EXITING → TV_ON
TV_ON → TV_OFF → TV_ON
TV_ON → OVERHEATING → TV_OFF (télé qui fume)
```
- Chaque état définit les entrées clavier acceptées.
- Les transitions sont des timelines GSAP annulables proprement.

### 6.6 Animations de la main et du corps
- Main + pouce + télécommande en hiérarchie d'objets, animées par code (rotations, interpolations), pas de rig complexe.
- Une animation par bouton (le pouce va vers le bouton, appuie, revient).
- Variante « nerveuse » pour le zapping rapide (amplitude et vitesse qui augmentent).
- Jambes/pieds : objets sous le champ de vision qui ne remontent que pendant l'éjection.

---

## 7. Contenu

### 7.1 Données des projets (`projects.json`)
```json
[
  {
    "channel": 1,
    "slug": "nom-du-projet",
    "title": "Nom du projet",
    "year": 2025,
    "role": "Rôle sur le projet",
    "tools": ["Outil 1", "Outil 2"],
    "loop": "/video/loops/nom-du-projet.mp4",
    "video": "/video/full/nom-du-projet.mp4",
    "poster": "/video/posters/nom-du-projet.webp",
    "description": "Texte de présentation.",
    "links": [{ "label": "Voir le site", "url": "https://..." }]
  }
]
```
Tant que les vraies vidéos ne sont pas fournies : utiliser des **fausses chaînes** (mire de couleurs, neige, vidéos générées en shader) pour développer.

### 7.2 Vidéos
- **Boucles de chaîne** : 5 à 10 s, 480p à 720p (le filtre CRT masque la basse résolution), H.264 MP4 + WebM, environ 1 à 2 Mo chacune. Boucle parfaite, muette ou avec un son court.
- **Vidéos complètes de projet** : 720p à 1080p, chargées au moment de l'entrée dans le projet.
- Les vidéos de chaque projet seront montées avec l'auteur, qui fournira les fichiers.

### 7.3 Stratégie de chargement des vidéos
- Préchargement complet des boucles de chaîne pendant la barre de chargement.
- Vidéo complète : démarrer le téléchargement **dès que la chaîne est affichée** (`preload="metadata"` puis `auto` après quelques secondes sur la même chaîne), et la transition d'aspiration (~1,2 s) laisse le temps au début de la vidéo d'arriver.
- Un seul élément `<video>` actif à la fois pour la télé, les autres en pause.

---

## 8. Audio

| Catégorie | Sons |
|---|---|
| Intro | respiration, bâillement, clic d'interrupteur, grésillement d'ampoule, allumage CRT (thump + sifflement aigu) |
| Télécommande | clic de bouton (variantes), clic plastique |
| Télé | neige/grésillement (court et long), changement de chaîne, son des boucles vidéo, extinction CRT, crépitements de surchauffe |
| Transitions | aspiration (woosh montant), éjection, chute dans le canapé, ressorts |
| Chat | pas feutrés, miaulement, ronronnement |
| Ambiance permanente (faible, télé allumée ou éteinte) | pièce, frigo, horloge, ville lointaine, sirène, voisins qui se disputent étouffés, craquements de plancher |

- Groupes de volume séparés : télé (contrôlée par VOL±), ambiance, effets.
- Le son de la télé est légèrement **filtré** (passe-bande, petit haut-parleur) pour sonner « vieille télé ».
- Spatialisation légère selon l'orientation de la tête (panoramique stéréo).
- Formats : MP3/OGG compressés, sprites audio pour les petits sons.
- **État actuel** : les sons sont de **vrais enregistrements CC0** de [BigSoundBank](https://bigsoundbank.com) (`public/salon/audio/`, liste dans `ATTRIBUTIONS.md`), joués et traités en WebAudio (`src/salon/audio/`) et spatialisés en 3D (HRTF, l'écoute suit la tête). Restent synthétisés faute d'enregistrement libre : l'allumage de la télé, le clic de la télécommande, la réception du chat, la neige (bruit blanc), le fond d'air de la pièce et la musique provisoire des chaînes. `core/Audio.ts` est la seule porte d'entrée : remplacer un son ne touche pas aux appelants.
- Chaque nouveau son doit avoir une licence compatible (CC0 de préférence) et être ajouté à `ATTRIBUTIONS.md`.

---

## 9. Performance et poids

- Objectif : **60 fps stables** sur un ordinateur portable moyen (GPU intégré récent).
- Poids cible hors vidéos complètes : **moins de 15-20 Mo** au chargement initial (essentiellement les boucles vidéo et les sons ; la scène générée en code ne pèse presque rien).
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`.
- Filtre peinture en demi-résolution si besoin.
- Prévoir un **réglage de qualité automatique** : mesurer les fps au démarrage et baisser la résolution du post-process si nécessaire.
- Aucune allocation d'objets dans la boucle de rendu (réutiliser les vecteurs, matrices, couleurs).
- Compiler tous les shaders avant l'intro.
- Mettre en pause le rendu quand l'onglet est caché.

---

## 10. Accessibilité et robustesse

- Respecter `prefers-reduced-motion` : réduire les tremblements de caméra et les flashs (les transitions restent, en version adoucie).
- Attention aux flashs de la lampe au démarrage : pas de clignotement rapide plein écran (risque photosensible).
- Si WebGL n'est pas disponible : afficher une page de secours simple listant les projets.
- Le site doit fonctionner sur Chrome, Firefox, Safari et Edge récents.

---

## 11. Feuille de route

### Phase 1 — Prototype du cœur
- Salon de base construit en code, caméra assise, tête à la souris avec inertie.
- Télé avec shader CRT, fausses chaînes, zapping clavier, grésillement.
- Main + télécommande avec appui animé sur les boutons.
- Filtre peinture + masque de l'écran net.
- Lumière dynamique de la télé.
- Mode tactile/gyroscope de test.
**Critère de validation** : en zappant, l'ambiance doit déjà être grisante.

### Phase 2 — Entrer et sortir
- Machine à états complète.
- Aspiration dans la télé, page projet de base, éjection avec les pieds qui se lèvent.

### Phase 3 — Intro et chargement
- Barre de chargement, clic de démarrage, réveil (paupières, lampe qui clignote, allumage CRT).

### Phase 4 — Vie et détails
- Chat, télé qui fume, extinction et ambiance télé éteinte, volume et OSD, inactivité.

### Phase 5 — Contenu réel
- Intégration des vraies vidéos et des données des projets, finalisation du design de la page projet.

### Phase 6 — Optimisation et finitions
- Performance, qualité automatique, tests navigateurs, accessibilité, polissage du son.

---

## 12. Questions encore ouvertes

- Design exact de la page projet à l'intérieur de la télé (proposer plusieurs variantes).
- Nombre de projets / chaînes.
- Ce qu'affichent les chaînes « vides » s'il y en a (mire, neige, fausse pub ?).
- Remplacement éventuel de la main et du chat par des modèles téléchargés.
- Nom du site et éventuelle « chaîne 0 » de présentation de l'auteur (à proposer).

---

## 13. Version mobile (V2, plus tard)

La version mobile est **la même expérience que sur desktop** (salon, télé, chaînes, transitions), avec le **mode paysage obligatoire** : en portrait, un écran (dans la DA) invite à tourner le téléphone. Les contrôles reprennent a priori le mode tactile de test (§5.3) : tête au gyroscope, télécommande tactile.

À ne pas développer en V1, mais l'architecture doit le permettre sans refonte : entrées abstraites (clavier/souris ou tactile/gyroscope), cadrage adaptable aux ratios paysage des téléphones, réglage de qualité automatique (§9) pour les GPU mobiles.

---

## 14. Conventions de travail

- Code et commentaires en anglais, échanges avec l'auteur en français.
- Toujours montrer le résultat (lancer le serveur de dev, tester) avant de passer à la suite.
- Petites étapes testables plutôt qu'une énorme livraison.
- Tout effet visuel doit être réglable via des constantes centralisées (ex. `config.ts` : amplitude de tête, intensité du filtre, durées des transitions) pour pouvoir itérer vite avec l'auteur.
- Ajouter un panneau de réglage de développement (lil-gui), désactivé en production.
