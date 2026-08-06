# Agir Pour Toutes (AGPT) — page projet showcase

**Date :** 2026-08-06 · **Statut :** design validé, en implémentation · branche `feat/agpt`

## Objectif
7ᵉ page projet sur-mesure. **Projet de branding + web** : création de la marque
**Agir Pour Toutes** (accompagnement des femmes — grossesse, naissance,
post-partum, bien-être) et de sa plateforme (clubs thématiques). Délégué depuis
`ProjetDetail` quand `id === 'agpt'` (contenu déjà réel dans `projetsData`).

## Décision (l'utilisateur a délégué)
« Découpe les captures, mets-les comme tu veux, garde la même DA. » → traitement
**BESPOKE, DA de la marque AGPT** (pas le template neutre). La page force le
thème **light** (marque chaleureuse/claire) → header/footer clairs.

## DA / Palette (reprise du site AGPT)
- Fond **crème** `#FDF7F2` · sections **blush** `#FBEDE7` · bande **mauve**
  `#C99B93` · **bordeaux** `#5E1C33` (footer/hero) · accent **rose** `#E93C8C`
  · encre `#3E2028`.
- Titres **serif Playfair Display** (élégant, éditorial, italique pour accents).
  Corps **Manrope**. Cartes arrondies, pills, motif **♀**.

## Assets (`node -e sharp`, découpe des pages)
- Bandes de pages (haut, 1920×1300) → `agpt-p-{home,grossesse,club,article,
  annuaire,savoir,ressources}.webp`. Hero = `agptFullImage` (mockup laptop du
  site sur étagère + plantes, déjà dans projetsData).

## Sections
```
Hero — mockup laptop AGPT, titre "Agir Pour Toutes" (serif), eyebrow
       "IDENTITÉ DE MARQUE · SITE WEB · 2024", thèse chaleureuse, scrim bordeaux
Barre méta — Rôle (UX/UI & DA) · Client · Nature · Année + « Voir le site »
01 Contexte — feuille blanche, univers chaleureux/premium/crédible sans clichés
02 L'univers de marque  ← SIGNATURE (brand board natif : palette + typo + logo)
03 Le site — bandes des pages (home, grossesse, club, article, annuaire) en
   tuiles arrondies + lightbox
04 La démarche — identité → DA → plateforme → accompagnement fondatrices
05 Impact — identité complète, plateforme lancée, univers structuré
ContactFooter
```

## Signature — l'univers de marque (brand board)
- Panneau blush arrondi avec motif ♀ en filigrane, contenant :
  - **Logo/wordmark** « Agir pour toutes. » (Playfair « Agir » + sans).
  - **Palette** : rangée de swatches (Crème, Blush, Rose, Mauve, Bordeaux) + hex.
  - **Typographie** : specimen Playfair (« Aa », « Agir Pour Toutes », italique)
    + specimen Manrope (texte courant).
- Recréé nativement (pas de capture) → net, on-brand, léger.

## Le site (03)
- Tuiles image arrondies (bandes de pages découpées), grille 2 colonnes, ombres
  douces, légendes ; clic → `ImageLightbox`.

## Hors périmètre (YAGNI)
- Pas de recréation du site. Pas de logo SVG (wordmark en Playfair suffit).

## Critères de réussite
- Finition des pages précédentes ; la DA AGPT est fidèlement respectée (serif +
  blush/rose/bordeaux) ; `tsc`/vitest(88)/build/budget OK ; rendu validé capture.
