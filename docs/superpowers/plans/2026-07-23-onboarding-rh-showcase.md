# Onboarding RH — page projet showcase · Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page projet sur-mesure `OnboardingRHShowcase`, au niveau de finition de Mauni, présentant les deux espaces (arrivant + RH) avec une charnière « face-à-face » et une frise du parcours.

**Architecture:** Nouveau composant `OnboardingRHShowcase.tsx` + `.css` (scopé `.onboarding-showcase`), délégué depuis `ProjetDetail` quand `id === 'onboarding-rh'`. Réutilise les patterns de `MauniShowcase` (hero morph, rail scroll-spy, illumination des titres, galerie horizontale épinglée, footer, lightbox), avec deux différences structurantes : **mockups fenêtre navigateur** (pas iPhone) et **deux galeries épinglées** (le JS de galerie doit fonctionner en multi-instances).

**Tech Stack:** React + Vite + TypeScript, `motion`, react-router, Bricolage Grotesque + Manrope, tokens `--portfolio-*`, `sharp` (conversion webp), Playwright (vérif visuelle), vitest (suite existante), Biome (bloqué par l'env — on s'appuie sur `tsc`).

## Global Constraints

- **Référence vivante** : `src/app/pages/MauniShowcase.tsx` et `MauniShowcase.css` sont le gabarit. Lire ces deux fichiers avant de coder — on adapte, on ne réinvente pas.
- **Bilingue FR/EN** via `useT` (objet `STRINGS = { fr, en }`), contenu codé en dur dans le composant.
- **Scroll container = `<body>`** (`document.body.scrollTop`), listeners sur `document.body`. Ne PAS utiliser `window.scrollY`.
- **Hero aligné sur le morph** : `100vw × 100vh`, `.cover { object-fit: cover; object-position: center }`, image = `projet.image` (même image que la carte → morph aligné).
- **Accent** : `--onboarding-accent` (vert Spvie), défini clair + override `.dark`. Reste des couleurs via tokens `--portfolio-*`.
- **`figma:asset/X.webp` → `src/assets/X.webp`** (plugin `figmaAssetResolver` dans vite.config).
- **Pas d'unit test pour la page visuelle** (comme Mauni) : la vérification = `npx tsc --noEmit` (0 erreur) + `npx vitest run` (88 tests toujours verts) + captures Playwright (viewport 1662×950, clair ET sombre). `document.body.scrollTop` pour positionner le scroll.
- **Commits fréquents**, un par tâche, trailer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Nettoyer les dev servers** parasites après captures (`Get-NetTCPConnection -LocalPort 5173..5180 | Stop-Process`).
- **Branche** : `feat/onboarding-rh-showcase` (déjà créée).

---

## File Structure

- **Create** `scripts/convert-onboarding-assets.mjs` — conversion PNG (OneDrive) → webp (`src/assets/`), one-off avec `sharp`.
- **Create** `src/assets/onb-*.webp` — 10 écrans convertis (+ hero déjà présent : `onboarding-rh-hero.webp`).
- **Create** `src/app/pages/OnboardingRHShowcase.tsx` — le composant page (hero, rail, sections, 2 galeries, charnière, frise, impact, footer, lightbox).
- **Create** `src/app/pages/OnboardingRHShowcase.css` — styles scopés `.onboarding-showcase` (accent vert, mockup navigateur, galeries, frise, charnière).
- **Modify** `src/app/pages/ProjetDetail.tsx:16` (import) et `:111` (délégation).

---

## Task 1: Convertir et placer les 10 écrans

**Files:**
- Create: `scripts/convert-onboarding-assets.mjs`
- Create: `src/assets/onb-arrivant-{accueil,parcours,detail-etape,success,equipe}.webp`
- Create: `src/assets/onb-rh-{tableau-de-bord,modeles,parcours,detail-etape,equipe}.webp`

**Interfaces:**
- Produces: 10 fichiers webp importables via `figma:asset/onb-*.webp`.

- [ ] **Step 1: Écrire le script de conversion**

```js
// scripts/convert-onboarding-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const SRC = 'C:/Users/alexis.kabiche/OneDrive - SPVIE/Bureau/Dossiers/Perso/Portfolio/Onboarding RH';
const OUT = 'src/assets';
mkdirSync(OUT, { recursive: true });
const map = [
  ['arrivant/accueil.png', 'onb-arrivant-accueil.webp'],
  ['arrivant/parcours.png', 'onb-arrivant-parcours.webp'],
  ['arrivant/détail étape.png', 'onb-arrivant-detail-etape.webp'],
  ['arrivant/success.png', 'onb-arrivant-success.webp'],
  ['arrivant/Equipe.png', 'onb-arrivant-equipe.webp'],
  ['Admin/accueil.png', 'onb-rh-tableau-de-bord.webp'],
  ['Admin/Bienvenue.png', 'onb-rh-modeles.webp'],
  ['Admin/parcours.png', 'onb-rh-parcours.webp'],
  ['Admin/détail étape.png', 'onb-rh-detail-etape.webp'],
  ['Admin/Equipe.png', 'onb-rh-equipe.webp'],
];
for (const [src, out] of map) {
  await sharp(`${SRC}/${src}`).resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(`${OUT}/${out}`);
  console.log('✓', out);
}
```

- [ ] **Step 2: Exécuter**

Run: `node scripts/convert-onboarding-assets.mjs`
Expected: 10 lignes `✓ onb-...webp`, aucune erreur.

- [ ] **Step 3: Vérifier les fichiers**

Run: `ls -la src/assets/onb-*.webp | wc -l`
Expected: `10`

- [ ] **Step 4: Commit**

```bash
git add scripts/convert-onboarding-assets.mjs src/assets/onb-*.webp
git commit -m "chore(onboarding-rh): écrans convertis en webp + script de conversion"
```

---

## Task 2: Délégation + squelette page + CSS de base

**Files:**
- Create: `src/app/pages/OnboardingRHShowcase.tsx`
- Create: `src/app/pages/OnboardingRHShowcase.css`
- Modify: `src/app/pages/ProjetDetail.tsx` (import ligne ~16, délégation ligne ~111)

**Interfaces:**
- Consumes: `Projet` (type), `projet.image` (hero).
- Produces: `export default function OnboardingRHShowcase({ projet }: { projet: Projet })`.

- [ ] **Step 1: Squelette du composant**

Créer `OnboardingRHShowcase.tsx` minimal : imports (`@fontsource-variable/bricolage-grotesque`, la CSS, `useEffect/useRef/useState`, `ContactFooter`, `PageMeta`, `ImageLightbox`, `useLang/useT`, type `Projet`), un `STRINGS = { fr:{...}, en:{...} }` embryonnaire, et un rendu : `<div className="onboarding-showcase" ref={rootRef}>` avec `<PageMeta .../>`, un `<section className="m-hero">` (image `projet.image` en `.cover`), et `<ContactFooter />`. S'inspirer de la tête de `MauniShowcase.tsx`.

- [ ] **Step 2: CSS de base**

Créer `OnboardingRHShowcase.css` scopé `.onboarding-showcase` : reprendre de `MauniShowcase.css` les variables (`--mtop: 134px`, `--title-font`), `.wrap { width: min(1220px, 90vw); margin-inline: auto }`, `.m-hero { position: relative; width: 100vw; height: 100vh; ... overflow: hidden }`, `.m-hero .cover { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center }`. Définir l'accent : `.onboarding-showcase { --onboarding-accent: #15803d; }` et `.dark .onboarding-showcase { --onboarding-accent: #34d399; }` (valeurs à affiner au rendu).

- [ ] **Step 3: Délégation dans ProjetDetail**

Modifier `ProjetDetail.tsx` : ajouter `import OnboardingRHShowcase from './OnboardingRHShowcase';` (près de la ligne 16), et après le bloc `if (projet.id === 'mauni')` (ligne ~113) ajouter :
```tsx
if (projet.id === 'onboarding-rh') {
  return <OnboardingRHShowcase projet={projet} />;
}
```

- [ ] **Step 4: Vérifier**

Run: `npx tsc --noEmit` → 0 erreur.
Lancer `npm run dev`, capturer `http://localhost:5173/projets/onboarding-rh` (Playwright, 1662×950) → le hero MacBook plein cadre s'affiche, footer présent.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/OnboardingRHShowcase.tsx src/app/pages/OnboardingRHShowcase.css src/app/pages/ProjetDetail.tsx
git commit -m "feat(onboarding-rh): délégation + squelette page + hero"
```

---

## Task 3: Hero complet (eyebrow, titre, thèse, fondu)

**Files:** Modify `OnboardingRHShowcase.tsx`, `OnboardingRHShowcase.css`

- [ ] **Step 1:** Dans le hero, ajouter la `.wrap > .in` avec : eyebrow (`ONBOARDING RH · SPVIE · 2025`), titre `<h1 class="title">Onboarding RH</h1>` (Bricolage), thèse (`renderWords`-style, accent sur un fragment), et l'indice « ↓ étude de cas ». Reprendre le fondu d'apparition CSS de `.m-hero .in` de Mauni (pas d'animation lettre-par-lettre).
- [ ] **Step 2:** CSS : styles `.m-hero .in`, `.ey`, `.title`, `.thesis` repris/adaptés de Mauni ; accent vert sur le fragment mis en avant.
- [ ] **Step 3: Vérifier** — capture hero clair + sombre : titre lisible, scrim correct, texte aligné en bas.
- [ ] **Step 4: Commit** — `feat(onboarding-rh): hero (eyebrow, titre, thèse)`

---

## Task 4: Rail d'index (scroll-spy) + sections Contexte & Rôle + illumination

**Files:** Modify `OnboardingRHShowcase.tsx`, `OnboardingRHShowcase.css`

**Interfaces:**
- Produces: fonctions internes `renderWords(text, accent, keyPrefix)` et composant `Lead` (copiés de Mauni), + l'effet `litUpdate()` (illumination) branché dans le `useEffect` principal + `onScroll`.

- [ ] **Step 1:** Ajouter la `.layout` (grid `280px 1fr`) : à gauche `.rail` (étude de cas, titre, sous-titre, méta `Rôle/Contexte/Période/Année`, `.nav` avec les 5 entrées : Contexte, Rôle, Arrivant, RH, Impact) ; à droite le flux de sections `<section class="sec" id="onb-s1" data-sec>` … Reprendre `renderWords` + `Lead` + l'illumination mot-par-mot de Mauni (spans `.wd` en JSX, opacité pilotée au scroll).
- [ ] **Step 2:** Scroll-spy : IntersectionObserver sur `[data-sec]` qui met `.on` sur l'entrée `.nav` correspondante (copié de Mauni). Le clic sur une entrée `.nav` défile vers la section (via `scrollBodyTo`).
- [ ] **Step 3:** Remplir **01 Contexte** et **02 Rôle** (premier jet FR/EN : onboarding dispersé sans suivi ; rôle + problématique deux publics + liste d'interventions). Sections 03/04/05 en placeholders `<section>` vides pour l'instant.
- [ ] **Step 4:** CSS `.layout`, `.rail`, `.nav`, `.sec`, `.lead`, `.wd` repris de Mauni (accent vert). Espacements haut (sous le header) et bas (avant footer) comme Mauni.
- [ ] **Step 5: Vérifier** — `tsc` 0 ; capture : rail à gauche, scroll-spy actif, titres qui s'illuminent au scroll.
- [ ] **Step 6: Commit** — `feat(onboarding-rh): rail scroll-spy + sections contexte & rôle`

---

## Task 5: Composant mockup « fenêtre navigateur » (CSS)

**Files:** Modify `OnboardingRHShowcase.tsx` (petit sous-composant `BrowserFrame`), `OnboardingRHShowcase.css`

**Interfaces:**
- Produces: `function BrowserFrame({ src, alt, url, onClick }: { src: string; alt: string; url: string; onClick?: () => void })` → une fenêtre navigateur (`.bwin` > `.bbar` (3 pastilles + `.baddr` url) + `.bshot` (img)).

- [ ] **Step 1:** Écrire `BrowserFrame` : `<figure class="bwin">` (ou `<button>` si cliquable pour lightbox) avec `.bbar` (3 `<span class="dot">` + `<span class="baddr">{url}</span>`) et l'image `.bshot`.
- [ ] **Step 2:** CSS `.bwin` : coins arrondis, ombre portée douce, **tranche via bordure en dégradé** (technique `background-clip: padding-box/border-box`, pas de `z-index:-1` — leçon Mauni). `.bbar` (barre claire, hauteur ~34px, pastilles rouge/jaune/vert, pill d'adresse gris). `.bshot { width:100%; display:block }`. Respecte ratio ~1,95 des captures.
- [ ] **Step 3: Vérifier** — insérer temporairement un `BrowserFrame` avec `onb-arrivant-accueil.webp`, capturer → fenêtre propre (barre + adresse `spvie.dev/onboarding`), ombre non coupée.
- [ ] **Step 4: Commit** — `feat(onboarding-rh): mockup fenêtre navigateur (CSS)`

---

## Task 6: Galerie épinglée multi-instances + Espace arrivant (03)

**Files:** Modify `OnboardingRHShowcase.tsx`, `OnboardingRHShowcase.css`

**Interfaces:**
- Produces: la mécanique de galerie épinglée **paramétrée par instance** — chaque galerie a son `#…-hwrap/#…-hpin/#…-hviewport/#…-htrack/#…-hbarfill`. Le `useEffect` initialise un tableau de galeries et boucle `measure()/hUpdate()` sur **chacune** (au lieu d'une seule comme Mauni). Fonction interne `Gallery({ id, screens, urlBase })`.

- [ ] **Step 1:** Généraliser la galerie de Mauni pour N instances : factoriser `measure(g)`/`hUpdate(g)` prenant une structure `{ hwrap, hpin, hview, htrack, hbar, pinned, D }`. Au montage, `querySelectorAll('[data-gallery]')` → une entrée par galerie ; `onScroll` boucle sur toutes. Reprendre : bleed du viewport à droite, barre « Défiler », fondus latéraux (`::before/::after` descendant sous la galerie, cf. Mauni), fallback mobile (`gfallback` < 861px).
- [ ] **Step 2:** Composant `Gallery({ id, screens })` : rend `.hwrap > .hpin > (.gbar (Défiler + rien d'autre — pas de toggle) , .hviewport > .htrack > [BrowserFrame par écran] + .gspacer)`. Écrans arrivant : accueil, parcours, détail étape, success, équipe, avec légendes FR/EN. Clic → `setLbIndex`.
- [ ] **Step 3:** Section **03 Espace arrivant** : titre/lead (l'expérience du nouveau, chaleureuse et gamifiée) + `<Gallery id="onb-arr" screens={ARRIVANT} />`.
- [ ] **Step 4:** CSS galerie repris de Mauni (`.hwrap/.hpin/.hviewport/.htrack/.gitem/.gbar/.gspacer/.gfallback`) — adapté aux fenêtres larges (`.gitem` largeur basée sur la hauteur × ratio 1,95). `.gbar` sans `.gswitch`.
- [ ] **Step 5: Vérifier** — capture à plusieurs positions de scroll : la galerie s'épingle, défile horizontalement, fondus OK, ombres non coupées, lightbox au clic. Ajuster la hauteur des fenêtres si le défilement paraît trop long (cf. risque spec).
- [ ] **Step 6: Commit** — `feat(onboarding-rh): galerie épinglée multi-instances + espace arrivant`

---

## Task 7: Espace RH (04) — 2e galerie

**Files:** Modify `OnboardingRHShowcase.tsx`

- [ ] **Step 1:** Définir `RH = [tableau-de-bord, modèles, parcours, détail étape, équipe]` (légendes FR/EN), `urlBase = 'rh.spvie.dev'`.
- [ ] **Step 2:** Section **04 Espace RH** : titre/lead (le pilotage, la configuration du parcours) + `<Gallery id="onb-rh" screens={RH} />`. Vérifier que le multi-instances de Task 6 gère bien les DEUX galeries (indices lightbox distincts — utiliser un offset ou un tableau global d'images).
- [ ] **Step 3: Vérifier** — les deux galeries s'épinglent indépendamment ; lightbox ouvre le bon écran depuis chaque galerie ; `tsc` 0.
- [ ] **Step 4: Commit** — `feat(onboarding-rh): espace RH (2e galerie)`

---

## Task 8: Charnière « face-à-face »

**Files:** Modify `OnboardingRHShowcase.tsx`, `OnboardingRHShowcase.css`

- [ ] **Step 1:** Entre la section 03 et la section 04, insérer `<div class="facing reveal">` : deux `BrowserFrame` côte à côte — gauche `onb-rh-parcours` (kanban RH), droite `onb-arrivant-parcours` (parcours vécu) — reliés par une flèche/trait `.link`, sous une phrase-clé FR/EN « Ce que le RH construit → ce que l'arrivant vit ».
- [ ] **Step 2:** CSS `.facing` (grid 2 colonnes, gap, `.link` centrale avec flèche verte), `.reveal` (fondu + translate au scroll via l'observer `.reveal` repris de Mauni). Responsive : colonne unique < 900px.
- [ ] **Step 3:** Brancher l'observer `.reveal` (copié de Mauni) dans le `useEffect`.
- [ ] **Step 4: Vérifier** — capture : diptyque net, trait/flèche entre les deux, révélation au scroll, empilé en mobile.
- [ ] **Step 5: Commit** — `feat(onboarding-rh): charnière face-à-face RH ↔ arrivant`

---

## Task 9: Frise du parcours (J-7 → J+30)

**Files:** Modify `OnboardingRHShowcase.tsx`, `OnboardingRHShowcase.css`

- [ ] **Step 1:** Entre 02 (Rôle) et 03 (Arrivant), insérer `<section class="timeline reveal">` : bande pleine largeur vert Spvie (dégradé), 4 jalons FR/EN — `J-7 · avant l'arrivée`, `Jour 1 · la bienvenue`, `1re semaine · l'immersion`, `J+30 · autonome` — reliés par une ligne horizontale, chacun avec un point `.node` + libellé + micro-description.
- [ ] **Step 2:** CSS `.timeline` (fond dégradé vert, pleine largeur `100vw` centrée comme le hero), `.tline` (ligne), `.tnode` (point + textes), responsive (empilement vertical < 720px). Révélation `.reveal` + progression animée optionnelle de la ligne (transform scaleX au scroll).
- [ ] **Step 3: Vérifier** — capture clair + sombre : frise lisible, contraste OK sur le vert, empilée en mobile.
- [ ] **Step 4: Commit** — `feat(onboarding-rh): frise du parcours J-7 → J+30`

---

## Task 10: Impact (05) + passe de contenu FR/EN complète + PageMeta

**Files:** Modify `OnboardingRHShowcase.tsx`

- [ ] **Step 1:** Section **05 Impact** : premier jet FR/EN (visibilité RH, autonomie des arrivants, 0 étape oubliée, adoption). Marquer clairement dans un commentaire que rôle exact + chiffres sont à valider par l'utilisateur.
- [ ] **Step 2:** Relire tout le `STRINGS` FR/EN : cohérence, pas de `[Texte provisoire]` restant dans le composant, légendes de galeries complètes, `PageMeta` (titre/description bilingues).
- [ ] **Step 3:** `ImageLightbox` : tableau global des 10 écrans + légendes, `lbIndex` ouvre le bon (offset galerie arrivant/RH).
- [ ] **Step 4: Vérifier** — `tsc` 0 ; `npx vitest run` → 88 tests verts ; `npm run build` OK.
- [ ] **Step 5: Commit** — `feat(onboarding-rh): section impact + contenu FR/EN complet`

---

## Task 11: Vérification finale + captures + nettoyage

**Files:** aucune (vérification)

- [ ] **Step 1:** `npx tsc --noEmit` (0) ; `npx vitest run` (88) ; `npm run build` (OK, budget bundle respecté).
- [ ] **Step 2:** Captures Playwright (1662×950) **clair ET sombre** : hero, contexte/rôle, frise, galerie arrivant (2-3 positions), charnière, galerie RH, impact. Vérifier alignements, fondus, ombres, lisibilité.
- [ ] **Step 3:** Basculer le thème (toggle header) sur la page → le cercle de révélation part du bouton, pas de casse ; vérifier la frise et les mockups en sombre.
- [ ] **Step 4:** Nettoyer les dev servers (`Get-NetTCPConnection -LocalPort 5173..5180 -State Listen | Stop-Process -Force`).
- [ ] **Step 5:** Pousser la branche : `git push -u origin feat/onboarding-rh-showcase` et donner l'URL preview Vercel (`site-portfolio-git-feat-onboarding-rh-showcase-16kabs-projects.vercel.app/projets/onboarding-rh`). NE PAS merger sur main sans validation utilisateur.

---

## Self-Review (couverture spec)

- Délégation + composant → Task 2 ✓
- Hero morph-aligné → Tasks 2-3 ✓
- Rail scroll-spy + illumination + Contexte/Rôle → Task 4 ✓
- Mockups fenêtre navigateur → Task 5 ✓
- Espace arrivant (galerie) → Task 6 ✓
- Espace RH (galerie) → Task 7 ✓ (multi-instances validé Task 6)
- Charnière face-à-face → Task 8 ✓
- Frise J-7 → J+30 → Task 9 ✓
- Impact + contenu FR/EN → Task 10 ✓
- Accent vert, bilingue, lightbox, footer → répartis Tasks 2/4/6/10 ✓
- Vérif tsc/vitest/build/captures → Task 11 ✓
- **Risque connu** (fenêtres larges → défilement long) traité en Task 6 Step 5 (ajustement hauteur) ✓
- **Hors périmètre** respecté : pas d'extraction module partagé, pas de refactor autres pages, contenu = premier jet.
