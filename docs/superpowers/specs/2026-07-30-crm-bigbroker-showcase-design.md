# CRM BigBroker — page projet showcase

**Date :** 2026-07-30 · **Statut :** design validé, en implémentation · branche `feat/crm-bigbroker`

## Objectif
6ᵉ page projet sur-mesure. **Étude de cas UX réelle** : conception du **CRM
interne BigBroker** (SPVIE Groupe), SaaS pour les équipes commerciales
téléphoniques. Essentiel : **centraliser les leads multi-sources, les dispatcher
(règles/quotas par équipe & conseiller), piloter la performance**. Délégué
depuis `ProjetDetail` quand `id === 'crm-bigbroker'` (contenu déjà réel dans
`projetsData`).

## Décisions validées (brainstorming)
1. **Traitement cohérent** (template neutre `--portfolio-*`) + **accent vert BB**
   (`--bb-accent`). Hero = mockup laptop existant (`crmBBHeroImage`, fiche
   assuré) — image CLAIRE → texte hero en SOMBRE + scrim clair.
2. **Signature = le dispatch en direct** : visualisation du cœur du CRM —
   sources (Splead, Datalead, ANI…) → moteur de dispatch (règles/quotas) →
   conseillers avec jauges de quota qui se remplissent. Flux animé (dots le long
   de connecteurs SVG) + bouton « Répartir ».
3. Contenu **réel** tiré de `projetsData`, traduit en EN.

## DA / Palette
- Template neutre clair/sombre. Accent **vert BB** : `--bb-accent` (vert/teal,
  ~#0f9d76 clair / #34d399 sombre), `--bb-teal` #0d9488 (boutons). Titres
  Bricolage Grotesque, corps Manrope. États : vert (ok/atteint), rouge (manque/
  non connecté), ambre (en cours).

## Assets (`scripts/convert-crm-bb-assets.mjs`)
- Écrans : `crm-bb-{board,conseiller,groupes,dispatch,import,relance}.webp`.
  Hero = `crmBBHeroImage` (fiche assuré sur laptop, déjà dans projetsData).

## Sections
```
Hero — mockup laptop (fiche assuré), titre "CRM BigBroker", eyebrow
       "SAAS INTERNE · BIGBROKER · 2024", thèse (centraliser & piloter)
Barre méta — Rôle (UX/UI Designer) · Client (BigBroker–SPVIE) · Nature · Année
01 Contexte & enjeux — pas d'outil centralisé, volume de leads, dispatch
   complexe, pas de visibilité (+ liste "Mon rôle")
02 Le dispatch en direct  ← SIGNATURE (diagramme animé)
03 Les écrans — dispatch board, fiche conseiller, groupes, dispatch, import,
   relance en cadres navigateur (stack/galerie)
04 La démarche — ateliers métier → structuration data → interfaces → pilotage
05 Impact — résultats réels
ContactFooter
```

## Signature — le dispatch en direct
- Diagramme 3 colonnes : **Sources** (4 cartes : Splead, Datalead, Comparateurs,
  ANI + volumes) → **Moteur de dispatch** (hub central : « règles par source ·
  quotas par équipe ») → **Conseillers** (4 cartes : nom + jauge quota
  done/quota, ex. C. Blanchet 12/12, A. Moreau 4/7).
- **Connecteurs SVG** calculés en JS (courbes source→hub, hub→conseiller),
  **dots animés** qui circulent (leads dispatchés) via SMIL `animateMotion`.
- **Jauges de quota** qui se remplissent au reveal (vert). Bouton « Répartir les
  leads » qui rejoue le remplissage. Recalcul des chemins au resize.
- Repli mobile : colonnes empilées, connecteurs masqués, jauges conservées.

## Les écrans (03)
- Écrans clés en **cadres navigateur** (`.bwin`), stack vertical avec légendes :
  Dispatch board, Fiche conseiller (modal), Groupes de dispatch, Règles par
  sources, Import de leads, Relance devis.

## Hors périmètre (YAGNI)
- Pas de dispatch fonctionnel, pas de vraie donnée. Diagramme = illustratif.

## Critères de réussite
- Finition des pages précédentes ; le dispatch se comprend d'un coup d'œil ;
  `tsc`/vitest(88)/build/budget OK ; rendu validé en capture clair + sombre.
