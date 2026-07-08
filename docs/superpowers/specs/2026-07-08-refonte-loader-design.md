# Refonte du loader (SplashScreen)

**Date :** 2026-07-08
**Statut :** Validé — prêt pour implémentation

## Objectif

Remplacer le loader actuel (monogramme « AK » qui se remplit puis panneau qui
descend, sensation de déconnexion) par un loader **minimal & intemporel**,
professionnel et épuré, basé sur le wordmark **« ALEXIS KABICHE »** du header.

## Concept : révélation du wordmark + rideau vers le haut

- Overlay plein écran, fond = couleur thème (sombre `#121312` / clair `#EAEAEA`).
- Centre : « ALEXIS KABICHE » en Manrope, majuscules, letter-spacing ~0.15em,
  taille responsive `clamp(26px, 6vw, 64px)`, couleur thème (sombre `#EAEAEA`
  / clair `#151615`).
- Fine ligne (1px) sous le wordmark, tracée de gauche à droite.

## Timeline (~2,3s)

1. **0 → 0.8s** — chaque lettre monte depuis un masque `overflow-hidden`, cascade
   ~25ms/lettre, ease-out.
2. **0.8 → 1.5s** — respiration ; la fine ligne se trace (scaleX 0→1).
3. **1.5 → 1.85s** — le wordmark s'efface et remonte de quelques px (avant le rideau).
4. **1.85 → 2.6s** — l'overlay remonte (`y: 0 → -100%`), courbe soignée, révèle la
   page d'un bloc ; en parallèle le wordmark du header apparaît en fondu (continuité).

## Détails

- Cohérence avec le header (même police/casse/esprit).
- `prefers-reduced-motion` : fallback fondu simple et rapide (pas de cascade ni rideau).
- Responsive desktop/mobile, wordmark centré et lisible.
- Fréquence inchangée : joué à chaque arrivée sur l'accueil (logique `showSplash`
  existante conservée).

## Implémentation

- Réécriture de `src/app/components/SplashScreen.tsx` avec `motion/react` :
  wordmark découpé en lettres, masques, variants orchestrés.
- Contrat `onComplete` conservé.
- `src/app/App.tsx` : exit de l'overlay passe de `y:100%` à `y:-100%`, easing affiné.
- Ajustement du délai d'apparition du wordmark header pour synchroniser le relais.
- Thème géré via l'observer `MutationObserver` existant.

## Critères de vérification

- Build OK (`npm run build`).
- Loader visible sur l'accueil : cascade des lettres → ligne → rideau vers le haut,
  page révélée proprement (plus de logo qui « tombe »).
- Rendu correct en thème sombre et clair, desktop et mobile.
- `prefers-reduced-motion` : version réduite fonctionnelle.

## Hors périmètre

- Pas de changement du header lui-même (juste la synchro du délai d'apparition).
- Pas de sous-titre type « Designer UX/UI » (écarté pour rester épuré).
