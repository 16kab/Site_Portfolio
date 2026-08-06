# Refonte du site SPVIE — page projet showcase

**Date :** 2026-08-06 · **Statut :** design validé, en implémentation · branche `feat/refonte-spvie`

## Objectif
8ᵉ page projet sur-mesure. **Étude de cas UX/vision** : refonte visuelle
stratégique du **site vitrine SPVIE** (particuliers), proposée à l'initiative
d'Alexis, présentée au DSI. Délégué depuis `ProjetDetail` quand
`id === 'refonte-spvie'` (contenu réel dans `projetsData`).

## Décisions validées (brainstorming)
1. **Signature = « la refonte qui défile »** : la homepage redesignée dans un
   cadre navigateur ÉPINGLÉ ; au scroll, toute la page défile à l'intérieur du
   cadre (scroll-synced translateY) → on découvre la refonte de haut en bas.
2. **Traitement = bespoke, DA de la refonte** : navy/charcoal + vert émeraude +
   blanc. Page claire (force le thème light), tick vert avant les eyebrows.

## DA / Palette (reprise de la refonte)
- Fond **blanc** `#ffffff` / surfaces `#f5f8f6` · **navy/charcoal** `#17262a`
  (bandes sombres, titres) · accent **vert émeraude** `#10b981` · encre
  `#17262a` / secondaire `#566a68`. Titres Bricolage Grotesque, corps Manrope.
  Tick vert vertical avant les eyebrows (comme la refonte).

## Assets (`scripts/convert-refonte-spvie-assets.mjs`)
- Pages complètes (tall) : `spvie-site-{home,categorie,offre}.webp`. Hero =
  `refonteSiteHeroImage` (mockup laptop sur fauteuil orange, déjà dans
  projetsData).

## Sections
```
Hero — mockup laptop, titre "Refonte du site SPVIE", eyebrow "REFONTE DE SITE
       · SPVIE ASSURANCES · 2025", thèse conversion, scrim navy
Barre méta — Rôle (UX/UI, à l'initiative) · Client · Nature · Année
01 Contexte — ~280 pages, design vieillissant, nav complexe, nouvelle DG
   croissance → initiative de refonte (+ interventions)
02 La refonte qui défile  ← SIGNATURE (homepage épinglée qui scrolle)
03 Les pages — catégorie + offre (tuiles recadrées, lightbox pleine page)
04 La démarche — analyse existant → simplification archi → refonte UX → vision
   acquisition
05 Impact — validée par le DSI, base d'évolution ; idées déjà intégrées (menu,
   footer)
ContactFooter
```

## Signature — la refonte qui défile
- `.rs-section` haute (~300vh) → room de scroll. `.rs-sticky` épinglé
  (position:sticky, 100vh, centré). `.rs-frame` = cadre navigateur (dots +
  adresse spvie-assurances.com) contenant `.rs-viewport` (overflow hidden,
  hauteur ~72vh) et `.rs-page` (la homepage complète, width 100%).
- JS (dans l'effet scroll) : progress de la section → `rs-page` translateY =
  `-progress * (pageHeight - viewportHeight)` → la homepage défile dans le cadre
  de haut en bas pendant qu'on scrolle la section.

## Les pages (03)
- `catégorie` + `offre` en tuiles (cadre navigateur ou carte arrondie),
  affichées recadrées (haut de page, object cover top), clic → `ImageLightbox`
  (page complète).

## Hors périmètre
- Pas de before/after (pas de captures de l'ancien site). Pas de lien « voir le
  site » (refonte = proposition, non livrée).

## Critères de réussite
- DA de la refonte fidèle (navy + vert), la homepage défile proprement dans le
  cadre ; `tsc`/vitest(88)/build/budget OK ; rendu validé capture.
