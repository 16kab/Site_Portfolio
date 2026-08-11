# Mauni « Lumière calme » — assets Higgsfield + intégration cinéma (design)

**Date :** 2026-07-23
**Base :** branche `feat/mauni-maj-captures` (les captures dark utilisées ici y vivent)
**Statut :** design validé, en attente de relecture — **génération bloquée à 0 crédit Higgsfield** (phase B armée, prête à tirer dès recharge)

## Objectif

Monter la page showcase Mauni au niveau « Awwwards » avec des assets générés
via Higgsfield, sous une direction artistique unique — **« Lumière calme »** —
qui prolonge l'univers réel de l'app (indigo→violet de la carte solde, fond
lavande, l'anneau des catégories menthe/corail/bleu) au lieu d'images IA
génériques.

## Décisions (validées)

1. **Formule « Cinéma »** : 4 pièces — hero still (A1), hero animé en boucle
   (A2), anneau macro (A3), main lifestyle (A4). Le film 20–30 s (pièce 5)
   est **hors périmètre** (éventuelle suite).
2. **Écran du hero** : vraie UI composée — la capture **Accueil sombre**
   (scène crépusculaire) est composée dans l'écran du téléphone.
3. **Portée du hero** : **partout** — on remplace le *contenu* de
   `src/assets/mauni-hero.webp` (même nom de fichier → showcase + carte
   /projets + og:image suivent sans changement de code).
4. **Composition** : flat composite par script sharp (téléphone quasi face
   caméra dans A1 pour rendre la superposition plane propre) ; retouche
   Photoshop par Alexis en option si besoin.

## Pipeline — l'ordre compte

```
A1 still (écran = lueur vide)
  → composite capture Accueil dark (script sharp)
    → A2 vidéo Seedance (start_image = image composée)
A3 anneau macro   — indépendant
A4 main + café    — indépendant
```

L'écran réel doit exister **avant** l'animation, sinon le modèle vidéo invente
l'UI en mouvement. Push-in très lent → l'écran composé reste stable.

## Les 4 cartes de génération

> Prompts en anglais (meilleure adhérence des modèles). Chaque carte peut
> demander 1–2 itérations : prévoir une marge de crédits. Avant chaque tir :
> `balance`.

### A1 — Hero still « l'aube indigo »

- **Modèle :** `nano_banana_2` · **Résolution :** 4k · **Ratio :** 16:9
- **Prompt :**
  « Cinematic product photography of a modern smartphone standing upright on a
  dark stone desk, screen facing the camera almost straight-on with a barely
  perceptible tilt, the screen is a blank softly glowing indigo-violet surface
  with no visible interface, volumetric light rays and fine dust particles in
  the air, dawn light seeping in from the left, deep soft shadows, frosted
  glass objects blurred in the background, subtle film grain, moody premium
  fintech advertisement, ultra realistic, shallow depth of field, indigo and
  violet palette »
- **Point clé :** écran vide lumineux (pas d'UI générée) → composite propre.
- **Sortie :** brute de travail, puis après composite →
  `src/assets/mauni-hero.webp` (remplace l'existant) + base de A2.

### Composite (entre A1 et A2) — script `scripts/composite-mauni-hero.mjs`

- sharp : superposition de `mauni-app-accueil-dark.webp` sur la zone écran
  (coordonnées mesurées sur la sortie A1), masque à coins arrondis, léger
  voile lumineux conservé par-dessus pour l'effet verre.
- Sorties : `mauni-hero.webp` (still finale) + PNG plein format pour A2.

### A2 — Hero loop « la respiration »

- **Modèle :** `seedance_2_0` · **Durée :** 6 s · **Résolution :** 1080p ·
  **Mode :** std · **Audio :** `generate_audio: false` · **Ratio :** 16:9
- **Média :** `start_image` = la still composée (upload via `media_upload`)
- **Prompt :**
  « Extremely slow cinematic push-in toward the phone, fine dust particles
  drifting through the volumetric light, the screen glow breathing very
  gently, the ambient dawn light shifting subtly warmer, everything else
  perfectly still, no camera shake, no text, seamless loop feeling »
- **Sortie :** `src/assets/mauni-hero-loop.mp4` (cible ~2–4 Mo ; si la sortie
  est plus lourde, ré-encodage optionnel — noter qu'ffmpeg n'est pas installé,
  à décider le moment venu).

### A3 — Interlude « l'anneau, en macro »

- **Modèle :** `nano_banana_2` · **Résolution :** 2k · **Ratio :** 21:9
- **Prompt :**
  « Abstract macro photography of a segmented ring made of frosted glass and
  titanium floating against a deep indigo gradient background, ring segments
  tinted mint green, coral red, soft blue and lavender, translucent premium
  materials, soft studio lighting, gentle bokeh, ultra minimal composition
  with generous negative space, premium fintech brand aesthetic,
  photorealistic 3D render »
- **Écho produit :** le donut des dépenses. Aucune UI → aucun risque
  d'hallucination.
- **Sortie :** `src/assets/mauni-interlude-anneau.webp`

### A4 — Interlude « la main, le matin »

- **Modèle :** `nano_banana_2` · **Résolution :** 2k · **Ratio :** 3:2 ·
  **Média référence :** `mauni-app-accueil.webp` (version claire — scène matin)
- **Prompt :**
  « Lifestyle editorial photography, close-up of a hand naturally holding an
  iPhone in the right half of the frame, the phone screen showing the exact
  budgeting app interface from the reference image, soft morning window
  light, blurred café interior with a coffee cup in the background, warm
  tones with a hint of lavender, shallow depth of field, authentic candid
  premium feel »
- **Risque connu :** l'UI référencée peut être approximative sur un écran
  incliné → si illisible, retouche Photoshop (Alexis) en repli.
- **Sortie :** `src/assets/mauni-interlude-main.webp`

## Intégration site

### Hero vidéo (MauniShowcase)

- `<video className="cover" src={heroLoop} poster={projet.image} autoPlay muted
  loop playsInline>` derrière le scrim existant ; si `prefers-reduced-motion`
  → `<img>` actuel (la still). Typo, scrim, zoom au scroll (`heroZoom` cible
  `.m-hero .cover`) et view-transitions conservés.
- **Couture de boucle** : le loop natif fait un saut visible sur un push-in.
  Technique retenue : attribut `loop` + micro-fondu d'opacité (~200 ms) vers le
  poster, déclenché par `timeupdate` près de la fin — la couture disparaît sous
  le scrim.
- CSS : `.cover` doit s'appliquer au `<video>` comme à l'`<img>`
  (object-fit cover) — ajustement de sélecteur si nécessaire.

### Interludes full-bleed

- Nouveau bloc `.m-interlude` (figure pleine largeur, débord hors colonne
  `.stream` comme la galerie), patron `reveal` existant.
  - **A4 la main** : après la section 01 (Contexte).
  - **A3 l'anneau** : avant la section 04 (Répartition).
- Alt FR/EN via `STRINGS` (courts, descriptifs).

### Fichiers & perf

- `mauni-hero.webp` : contenu remplacé, même nom → carte projet + og:image +
  poster cohérents, zéro changement dans `projetsData.ts`.
- Vidéo auto-hébergée → CSP intacte (`default-src 'self'` couvre `media-src`).
- Stills WebP ≤ ~250 Ko ; vidéo ~2–4 Mo, above-fold assumé avec poster
  instantané ; reduced-motion l'évite entièrement.
- Vite gère `.mp4` en asset nativement (pas de changement `assetsInclude`).

## Ce qui ne change pas

Copie narrative, galerie 6 écrans + toggle, sections 01–05, bandeau solde,
CSS global (hors ajouts `.m-interlude`/video), CSP, `projetsData.ts`.

## Hors périmètre

- Pièce 5 « le film Mauni » (20–30 s, CTA « Voir le film »).
- Upgrades purement code (grain, parallax) — chantier séparé éventuel.
- Recharge de crédits Higgsfield (côté utilisateur).

## Runbook Phase B (dès crédits)

1. `balance` — vérifier le solde.
2. Tir A1 → `job_status` → télécharger la brute.
3. `composite-mauni-hero.mjs` → still finale + contrôle visuel coins/alignement.
4. `media_upload` de la still composée → tir A2 → télécharger le mp4.
5. Tirs A3 + A4 (parallèles) → télécharger.
6. Optimisation (webp via sharp ; poids loggés) → dépôt dans `src/assets/`.
7. Intégration code (hero vidéo + interludes + alts).
8. Vérifs : typecheck, lint (non-régression), build, budget bundle, contrôle
   visuel clair/sombre + reduced-motion, couture de boucle invisible.

## Vérification (definition of done)

- 4 assets générés conformes à la DA (itérations comprises).
- Composite : capture alignée, coins propres, lisible.
- Hero : vidéo fluide sous scrim, fallback reduced-motion = still, carte
  /projets et og:image à jour automatiquement.
- Interludes : full-bleed propres aux deux thèmes, reveal OK.
- Build + typecheck + lint (6 findings préexistants, pas un de plus) + budget.
