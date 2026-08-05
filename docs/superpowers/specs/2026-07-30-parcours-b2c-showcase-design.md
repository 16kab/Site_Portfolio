# Parcours de souscription SPVIE (B2C) — page projet showcase

**Date :** 2026-07-30 · **Statut :** design validé, en implémentation · branche `feat/parcours-b2c`

## Objectif
5ᵉ page projet sur-mesure. **Étude de cas UX réelle** : refonte du tunnel de
souscription SPVIE (particuliers). But de la page : **mettre en avant la
facilité et la rapidité** du parcours refondu. Délégué depuis `ProjetDetail`
quand `id === 'parcours-spvieassurances'` (entrée de données déjà riche et
réelle — pas de premier jet).

## Décisions validées (brainstorming)
1. **Traitement cohérent** (template neutre clair/sombre comme Mauni/Onboarding/
   SYMA) + **accent vert menthe SPVIE** (`--spvie-accent`).
2. **Signature = les chiffres (le temps ressenti)** : avant/après **temporel**
   `30 min` (réel) → `~12 min` (ressenti), « temps perçu divisé par deux »,
   animé. PAS d'avant/après des écrans d'offres (anciennes maquettes perdues).
3. Contenu **réel** tiré de `projetsData` (contexte, problématique, démarche,
   impact), traduit en EN.
4. Hero = mockup laptop existant (`spvieHeroImage`, tunnel sur un bureau sombre).

## DA / Palette
- Template neutre `--portfolio-*` (clair/sombre standard).
- Accent **vert SPVIE** : `--spvie-accent` ≈ `#0a9d7a` (clair) / `#2ad4a8`
  (sombre) ; vert vif `--spvie-bright` `#12c69a` (barres/CTA). Titres Bricolage
  Grotesque, corps Manrope.

## Assets (`scripts/convert-spvie-b2c-assets.mjs`)
- 7 étapes du tunnel (desktop paysage) → `spvie-b2c-0{1..7}-*.webp` :
  01 type d'assurance, 02 besoins, 03 budget, 04 couverture, 05 offre,
  06 coordonnées, 07 récap. Hero = `spvieHeroImage` (déjà dans projetsData).

## Sections
```
Hero — mockup tunnel, titre, eyebrow "TUNNEL DE CONVERSION · SPVIE · 2024-2025",
       thèse « Un tunnel de 30 minutes, ressenti comme 12. »
Barre méta — Rôle (UX/UI Designer, en binôme) · Client (SPVIE) · Nature · Année
01 Contexte & friction — drop au moment des offres, parcours perçu long/complexe
02 Le temps ressenti  ← SIGNATURE (chiffre avant/après temporel, animé)
03 Le parcours repensé — 7 étapes réelles en cadres navigateur + stepper,
   sélecteur d'étape (flip), barre de progression → montre court/clair/guidé
04 La démarche — Audit → Restructuration → Refonte des offres → A/B testing
05 Impact — résultats réels
ContactFooter
```

## Signature — le temps ressenti
- Grand bloc chiffré : **30 min** (durée réelle) vs **~12 min** (durée
  ressentie), badge « ÷2 / temps perçu divisé par deux ». Deux barres
  horizontales (réelle pleine, ressentie ~40 % en vert) qui se remplissent au
  reveal ; compteurs animés. Sous-titre : « réduire la *perception* de longueur
  sans changer la logique métier ».
- 3-4 gains (issus de l'impact) : fluidité perçue ↑, compréhension des offres ↑,
  frictions supprimées, volume de leads ↑.

## Le parcours repensé (03)
- Cadre navigateur affichant l'étape active (une des 7 captures). **Sélecteur
  d'étapes** (puces numérotées + libellé) qui fait défiler l'écran ; bouton
  « Continuer › » qui avance (et boucle) ; barre de progression `n/7`. Démontre
  concrètement la rapidité/clarté. Repli mobile : sélecteur scrollable.

## Hors périmètre (YAGNI)
- Pas de recréation interactive des écrans (captures suffisent). Pas d'avant/
  après des offres (maquettes perdues). Pas de tunnel fonctionnel.

## Critères de réussite
- Finition Mauni/Onboarding/SYMA ; facilité/rapidité clairement mises en avant
  (thèse + chiffre + parcours court) ; `tsc`/vitest(88)/build/budget OK ; rendu
  validé en capture clair + sombre.
