# Refonte de l'application mobile CGRM — page projet showcase

**Date :** 2026-08-07 · **Statut :** design validé · branche `feat/mobile-cgrm-showcase`

## Objectif
10ᵉ (et dernière) page projet sur-mesure. Étude de cas **UI redesign / product
design mobile** : refonte visuelle de l'application mobile **CGRM** (entité du
groupe SPVIE, espace assuré), 2024. Déléguée depuis `ProjetDetail` quand
`id === 'mobile-cgrm'`. Contenu réel déjà dans `projetsData` (`mobile-cgrm` :
contexte, problématique, rôle, interventions, démarche×4, impact honnête —
« retours internes positifs »). 2ᵉ projet **mobile** (après TrackIt) → doit
trancher nettement avec le traitement sombre/cinématique de TrackIt.

## Décisions validées (questions posées à l'utilisateur)
1. **Signature = scrollytelling, téléphone épinglé** : un mockup iPhone plat
   reste **collé (sticky)** pendant que son écran **fond en fondu** d'une
   capture réelle à l'autre, synchronisé au scroll ; un **mini-indicateur de
   tab bar** (Accueil/Contrats/Échanges/Échéances/Contact) s'allume selon le
   beat courant. Récit qui défile à côté.
2. **Ambiance = claire & amicale**, fidèle à l'app (pas le cadre sombre de
   TrackIt).
3. **Écrans = vraies captures** placées dans le mockup (pixel-perfect), PAS de
   recréation HTML/CSS.
4. **Pas d'avant/après** (écrans de l'ancienne app non disponibles).

## Entrée / hero (leçon de la charte)
`projet.image` (= `cgrmHeroImage`, la cible que le morph d'ouverture agrandit)
est un **render 3D sombre** de l'iPhone (fond bleu) montrant l'Accueil. Le hero
**réutilise cette image** en plein écran → le morph atterrit dessus sans
rupture. Puis, au scroll, la page **bascule dans le monde clair** et le
scrollytelling commence (contraste sombre→clair assumé = révélation, et
différencie de TrackIt).

## DA — claire & amicale, fidèle à l'app
- **Tokens (clair, défaut)** : `--stage #eef1f4` · cartes `--card #ffffff` ·
  encre `--ink #12293a` / `--ink2 #5d7385` · **accent teal** `--teal #2ea9cc`
  (liens, tab active, chevrons) · dégradé pastille `#6fd0c2 → #39a8c9` ·
  data-viz : orange `#f4922e` + corail `#ef5a6f` (rappel de la barre segmentée).
- **theme-aware, identité CLAIRE d'abord** : override `.dark .cgrm-showcase`
  = variante douce sombre (fond `#0f1f2a`, cartes `#162c3a`) qui **garde le
  teal** ; le toggle global fonctionne. (Pas de forçage.)
- **Typo (vraies polices de l'app)** :
  - Titres = **Mont Heavy** (`Mont Heavy.ttf` → `src/assets/fonts/Mont-Heavy.ttf`).
  - Corps = **Mesmerize** (Regular/SemiBold/Bold, largeur normale →
    `Mesmerize-Regular.otf`, `-SemiBold.otf`, `-Bold.otf`).
  - `@font-face` dans `MobileCgrmShowcase.css` via
    `url('../../assets/fonts/…')` (même convention que Tusker Grotesk sur le
    CRM). Le fix FOUT global (`markArrival` gated sur `document.fonts.ready`
    dans `ProjetDetail`) couvre le chargement derrière l'overlay.
- **Mockup iPhone** dessiné en CSS (coins arrondis, dynamic island, bezel,
  ombre douce) contenant l'`<img>` de la capture.

## Assets
- Script `scripts/convert-cgrm-assets.mjs` (sharp, comme charte) : 6 captures
  `.jpg` de `…/Portfolio/CGRM` → `src/assets/cgrm-<slug>.webp` (width ~900,
  q82, portrait mobile). Mapping :
  - `accueil` ← « Homepage - Remboursements.jpg »
  - `remboursement` ← « Voir mes remboursements - remboursement.jpg »
  - `document` ← « Envoyer un document 01.jpg »
  - `contrats` ← « Contrats 01.jpg »
  - `echeances` ← « Echéances.jpg »
  - `echanges` ← « échanges - Devis.jpg »
- `cgrmHeroImage` (render 3D) et `cgrmScreensImage` (flat-lay) déjà importés
  dans `projetsData`.

## Signature — mécanique
- Structure : après le hero, une **section scrollytelling** en 2 colonnes.
  - Colonne gauche = **`.phone` sticky** (top centré), contenant une pile
    d'`<img>` (une par capture) superposées ; opacité pilotée au scroll.
  - Colonne droite = **beats** (`.beat`), un par écran/propos, hauteur ~90vh.
- Effet (un seul `useEffect`, scroll `document.body` rAF-throttlé — même socle
  que charte/refonte) : calcule le beat actif (celui dont le centre est le plus
  proche du centre du viewport) → **cross-fade** l'`<img>` correspondante
  (opacité 1, les autres 0) + **highlight** la tab correspondante dans la
  mini tab bar sous le téléphone. Léger `translateY`/scale sur l'écran actif.
- `prefers-reduced-motion` → bascule instantanée (pas de fondu animé), le beat
  actif reste piloté par le scroll.
- **Mobile** (≤ 900px) : les 2 colonnes s'empilent — le téléphone devient un
  bandeau sticky en haut (réduit), les beats défilent dessous ; ou fallback
  simple = téléphone non-sticky + un écran par beat. (À trancher en impl, viser
  la lisibilité.)

## Sections / récit (écran ↔ propos), contenu réel bilingue FR/EN
```
Hero            render 3D (cible du morph) + eyebrow + H1 (titre projet)
                + méta (Rôle · CGRM – SPVIE Groupe · 2024)
Contexte        « Une app qui marchait, une image qui datait. »        → accueil
                (design vieillissant, standards du groupe, refonte visuelle)
Parcours clés (le téléphone change à chaque beat) :
  Remboursements  clarté du décompte CGRM / Sécu / Reste à charge      → remboursement
  Envoyer un doc  catégorisation claire des envois                     → document
  Contrats        vue d'ensemble des contrats                          → contrats
  Échéances       statuts lisibles (payé / en attente / régul.)        → echeances
  Devis & échanges suivi des devis (en cours / terminé / refusé)       → echanges
Démarche        les 4 étapes réelles (analyse → charte → composants →
                recette avec les devs)                                 → accueil
Impact          HONNÊTE : retours internes positifs (clarté,
                modernisation, cohérence avec l'écosystème du groupe)  → remboursement
ContactFooter
```
Manifeste hero (FR) : « Refonte de l'application mobile CGRM » / sous-titre =
`subtitle` réel. Textes des beats = reformulations courtes du `contexte` /
`problematique` / `interventions` / `impact` réels (bilingue via `useT`).

## Critères de réussite
- DA fidèle (teal/navy + Mont Heavy/Mesmerize), scrollytelling fluide (fondu
  d'écrans net et synchronisé, tab bar cohérente), hero qui rattrape le morph,
  claire & amicale ≠ TrackIt. `tsc` / vitest (88) / build / budget verts ;
  captures relues clair + sombre ; pas de scroll horizontal.
