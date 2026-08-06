# Proposition de charte graphique SPVIE — page projet showcase

**Date :** 2026-08-06 · **Statut :** design validé · branche `feat/charte-spvie`

## Objectif
9ᵉ page projet sur-mesure. Étude de cas **branding / direction artistique** :
proposition de refonte de la charte graphique du groupe SPVIE (brand book
complet, 2024), présentée à la DirCom + au cofondateur ; non déployée
(changement de direction). Déléguée depuis `ProjetDetail` quand
`id === 'charte-spvie'`. Contenu réel dans `projetsData` (`charte-spvie`),
PDF du brand book dispo (`pdfUrl` Dropbox).

## Décisions validées
1. **Signature = « Dans l'univers de marque » (parallaxe profondeur)** : hero
   plein écran, texte manifeste central, ~10 slides curées flottant autour sur
   3 profondeurs (arrière-plan petites/sombres/floutées · médian net · **1er
   plan grand/flou passant devant le texte**), parallaxe souris + scroll.
2. **Traitement = bespoke, fidèle à la charte proposée** (monde sombre assumé).

## DA (charte proposée)
- Stage **vert-pin** `#17332f` (fond dominant) + profondeur `#1e433d`.
- Accent **émeraude** `#10d18a` (logo « // », highlights).
- Sous-marques : orange `#f4792a` · rose `#ec5b8e` · bleu `#3d92d1` ·
  prune `#2b2440` · violet `#8b7ff0`. Cartes **crème** `#f5f6f3`.
- Typo : **Poppins** (titres bold géométriques, proche de la charte) + corps
  Manrope. Motif **« // »** (barres inclinées arrondies) recréé en CSS.
- **Monde sombre forcé** sur la page (comme la charte), cartes crème pour les
  slides claires.

## Assets (`scripts/convert-charte-spvie-assets.mjs`, sharp)
Slides `.jpg` curées → `charte-<slug>.webp` (width 1280, q80). Matching par
nom normalisé (accents/espaces), on garde le fichier le plus court (évite les
doublons `-1`). Curées : identité, couleurs, typo(×2), pattern, éléments,
logo, explication logo, zones, marques, wealth/international/épargne, photos,
carte de visite, papeterie, social LinkedIn/Facebook, réseaux, mockups #1–4,
mockup site, mise en situation, présentation.

## Signature — mécanique parallaxe
- `.stage` plein écran (100vh), fond vert-pin + grandes formes « // » floues.
- `.field` : slides positionnées en absolu, `data-depth` ∈ {back, mid, front}.
  - back : scale ~0.5, `filter: blur + brightness↓`, opacité basse, z faible.
  - mid : net, scale ~0.8.
  - front : grand, `filter: blur`, z élevé (passe devant le `.manifesto`).
- `.manifesto` centré (z intermédiaire) : titre + sous-titre.
- JS (effet scroll/mousemove sur `document.body`) : chaque slide a un facteur
  de parallaxe selon sa profondeur ; `transform: translate(px souris,
  px scroll) scale`. `prefers-reduced-motion` → transform figé, blur conservé.

## Sections (brand book)
```
Hero parallaxe (signature)
Barre méta — Rôle · Client (SPVIE) · Nature (système d'identité) · 2024
             + lien PDF « voir le brand book »
01 Contexte — charte 2017 « casseur de codes », DirCom challenge l'équipe
02 Logo & déclinaisons
03 Couleurs — palette + logo sur fonds
04 Typographie
05 Pattern « // » + éléments graphiques
06 Les marques — Wealth Management (orange) · International (rose) ·
   Épargne & Retraite (bleu)
07 Applications — papeterie, réseaux sociaux, mockups (tuiles + lightbox)
08 Démarche — analyse → direction → système → présentation (4)
09 Impact — HONNÊTE : non déployé (changement de direction) mais a ouvert la
   réflexion + prouvé la capacité stratégique de l'équipe
ContactFooter
```
Contenu réel bilingue FR/EN. Slides → `ImageLightbox` au clic (zoom dispo).

## Manifeste central
FR : « Redonner à SPVIE une image à la hauteur. » / sous-titre : « Une
proposition complète — logo, couleurs, typographie, motifs — pour réunir tout
le groupe sous une identité cohérente et crédible. »

## Critères de réussite
- DA fidèle (vert-pin + émeraude + touches marques), parallaxe fluide et
  lisible (texte central toujours lisible), brand book clair. `tsc`/vitest(88)/
  build/budget verts ; captures relues.
