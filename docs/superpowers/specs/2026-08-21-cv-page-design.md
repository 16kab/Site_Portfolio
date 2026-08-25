# Page « CV » — CV A4 imprimable, dans le style du site

**Date :** 2026-08-21 · **Statut :** design validé (brainstorming)

## Objectif

Créer une page `/cv` affichant le CV d'Alexis Kabiche comme un **document A4
statique** (aucune animation), dans le **style du site** (monochrome, Manrope +
Bricolage), **bilingue** (suit la langue du site), et **exportable en PDF A4
vectoriel** via l'impression du navigateur (« Enregistrer en PDF »). Le bouton
« Voir le CV » de la page À propos, aujourd'hui désactivé (« bientôt »), est
activé et pointe vers `/cv`.

## Décisions validées (brainstorming)

1. **Format** = **1 page A4 portrait**, condensé (pas de pavés de bullets).
2. **Export** = **print CSS** (`window.print()` → « Enregistrer en PDF »).
   Rendu **vectoriel** (texte/CSS/SVG nets à tout zoom) ; seule la photo est
   bitmap. **Aucune dépendance**, toujours synchro avec la page.
3. **Langue** = **bilingue**, suit le toggle du site (imprime la langue active).
4. **Photo** = **oui** (fournie par l'utilisateur ; placeholder en attendant).
5. **Statique** = aucune animation/motion sur cette page (un document).
6. **Feuille toujours claire** = la « feuille A4 » est **blanche** quel que soit
   le thème du site (métaphore papier + cohérence d'impression). Elle est posée
   sur le fond thémé du site à l'écran (effet document sur un bureau).
7. **Titre pro** = « Product & Brand Designer ».
8. **Langues affichées** = Français (natif) · Anglais (professionnel).

## À fournir plus tard (placeholders honnêtes en attendant)

- **Photo** (bonne résolution) → emplacement réservé.
- **URL LinkedIn** → un placeholder clairement à remplacer (pas de lien mort
  trompeur ; libellé « LinkedIn » sans URL réelle tant qu'absente).

## État existant (repères)

- Routes dans `src/app/config/routes.ts` (`ROUTES`) — **pas** de `/cv`. À
  ajouter `CV: '/cv'`.
- `src/app/App.tsx` : pages lazy + `<Route>` sous `<RouteTransition>` /
  `<Suspense>`. Ajouter un `<Route path={ROUTES.CV}>` + page lazy `Cv`.
- `src/app/config/seo.ts` : `ROUTE_META` par route (SEO/partage). Ajouter
  l'entrée `/cv`.
- **À propos** (`src/app/pages/APropos.tsx`) : bouton « Voir le CV » = `<div>`
  `aria-disabled` avec « bientôt » (`t.cvSoon`) + `TODO(cv)`. À transformer en
  **`<Link to={ROUTES.CV}>`** actif (retrait de l'état désactivé et de
  `cvSoon`). Son test (`APropos.test.tsx`) affirme `aria-disabled="true"` → à
  mettre à jour (le bouton devient un lien vers `/cv`).
- `SITE_CONTACT` (`src/app/config/constants.ts`) : `email
  kabiche.alexis@gmail.com`, `phoneDisplay 06 20 44 74 05`,
  `phoneHref tel:+33620447405`, `location Paris, France`. Réutilisés pour le
  bloc contact du CV.
- Polices : `--font-manifeste` (Bricolage Grotesque) + Manrope déjà présentes.
- Tokens `--portfolio-*` (theme-aware) pour le **cadre** de page (fond) ; la
  **feuille** utilise des couleurs claires **fixes** (blanc/noir), pas les
  tokens, pour rester blanche en thème sombre et à l'impression.
- **motion/react** (jamais framer-motion) — mais la page CV n'anime rien.

## Structure de la page

### Cadre écran (hors impression)

- La page `/cv` affiche la **feuille A4** centrée sur le fond thémé du site,
  avec une **ombre douce** (aspect document). Un bouton **« Télécharger le
  PDF »** (Manrope, style bouton du site) au-dessus/à côté, **masqué à
  l'impression**.
- La feuille : `width: 210mm; min-height: 297mm; padding ≈ 14mm 16mm;
  background: #fff; color: #1A1A1A`. Sur petits écrans, la feuille est
  **réduite pour tenir** (scale responsive) ; à l'impression elle est exacte.
- **Statique** : pas de `ScrollReveal`/motion.

### Contenu de la feuille (A4, 2 colonnes)

**En-tête (pleine largeur)**
- **Nom** « Alexis Kabiche » en **Bricolage Grotesque** (grand).
- **Titre** « Product & Brand Designer ».
- **Photo** en haut à droite (cadrée, coins arrondis légers ; placeholder tant
  qu'absente).
- **Contact** (ligne compacte) : email · téléphone · Paris, France · LinkedIn ·
  alexiskabiche.com.
- **Accroche** courte (1 ligne) sous un filet fin.

**Corps — 2 colonnes**
- **Colonne large (~62 %) : Expérience** — 4 postes, chacun : `Poste —
  Entreprise · dates`, 1 ligne de description, tags clés.
- **Colonne étroite (~38 %) : Compétences · Outils · Formation · Langues.**

Labels de section en petites capitales tracké (langage du site) ; filets fins
`#E0E0E0` ; tags en style « badge » discret.

### Ordre de lecture / ATS (issu de la veille Behance/Dribbble/Awwwards)

La veille confirme la direction (typo éditoriale display+sans, grille, blanc
généreux, **tags plutôt que barres de compétences**, monochrome = « calm
confidence ») et surtout un piège : les CV 2 colonnes image-based cassent les
**ATS** (Workday/Greenhouse). Notre PDF étant **généré depuis du HTML à texte
réel**, on neutralise ce piège :

- **Ordre du DOM = ordre de lecture linéaire** : En-tête (nom, titre, contact) →
  Accroche → Expérience → Compétences → Outils → Formation → Langues. Le rendu
  2 colonnes est obtenu via CSS (grid/flex) **sans** casser cet ordre source →
  le flux de texte du PDF reste sain pour un parseur.
- **Pas de barres de compétences, pas d'icônes porteuses d'info, pas de texte
  en image** : toute information est du **texte réel** sélectionnable.
- Monochrome strict (aucun accent) — choix validé par la veille (« 1 accent OU
  neutres » ; on prend la version neutre, cohérente avec le site).

## Contenu (bilingue FR/EN — condensé 1 page)

Le contenu exact (FR canonique + EN) sera figé dans le plan, dérivé du parcours
déjà fourni :

- **Expérience** :
  1. **UX/UI Designer — SPVIE Assurances (CDI)** · Janvier 2024 → Aujourd'hui —
     conception produit de bout en bout (CRM BigBroker, LeadFactory, parcours
     B2B2C ~15 étapes, Espace Assuré) + design system multi-produits.
     Tags : CRM UX, B2B2C, Design System, Acquisition, A/B testing.
  2. **Consultant Digital / Chef de Projet — SPVIE Assurances** · Juil. → Déc.
     2023 — pilotage de projets digitaux transverses, cadrage fonctionnel.
     Tags : Gestion de projet, Cadrage, Coordination transverse.
  3. **Chargé de Communication — BPI Group / LHH (Alternance)** · Oct. 2020 →
     Oct. 2022 — refonte de l'identité et du site corporate, contenus, SEO.
     Tags : Identité visuelle, Architecture de l'info, SEO.
  4. **Graphiste — ShopInCar (Stage 6 mois)** · 2020 — refonte WebApp mobile &
     desktop, interfaces & supports. Tags : UI, Responsive, Ergonomie.
- **Formation** :
  - **Mastère Direction Artistique** — Manager de la Communication Numérique
    (Titre RNCP niv. 7) — **IIM Digital School** · 2018–2022.
  - **Baccalauréat Scientifique** (spé Sciences de l'Ingénieur) — Lycée de
    l'Essouriau, Les Ulis · 2017.
- **Compétences** : UX & Product Design · Brand & Visual Design · Design
  Systems & Ops · Workflows augmentés par l'IA · Recherche & Stratégie.
- **Outils** : Figma · Illustrator · Claude Code · ContentSquare.
- **Langues** : Français (natif) · Anglais (professionnel).
- **Accroche** : courte, dérivée de la thèse « produits clairs qui tiennent dans
  la durée » (formulation finale dans le plan, FR + EN).

Parité **FR/EN** obligatoire.

## Export / impression

- Bouton « Télécharger le PDF » → `window.print()`.
- **Print CSS** (`@media print`) :
  - `@page { size: A4; margin: 0; }`.
  - **Masquer le chrome du site** : header, fond (`.grainient-wrapper` /
    BackgroundWrapper), overlays de transition, et le bouton de téléchargement.
    (Sélecteurs exacts figés dans le plan ; vérifiés par une impression réelle.)
  - La **feuille** occupe la page seule : `box-shadow: none; margin: 0;`
    dimensions A4 exactes.
  - `print-color-adjust: exact` (et `-webkit-`) sur la feuille pour conserver
    filets/tags si teintés.
- Résultat : **PDF vectoriel** de la feuille, langue = langue active du site.

## Composants & fichiers

- **Create** `src/app/pages/Cv.tsx` — la page (cadre écran + feuille + bouton
  imprimer). Statique.
- **Create** `src/app/pages/Cv.content.ts` — contenu bilingue typé
  (expérience, formation, compétences, outils, langues, accroche, contact via
  `SITE_CONTACT`) + `getCvContent(lang)`.
- **Create** `src/app/pages/Cv.css` (ou styles co-localisés) — dimensions A4,
  cadre écran, et **bloc `@media print`**. Un fichier CSS dédié est justifié par
  le print CSS (difficile en inline).
- **Modify** `src/app/config/routes.ts` — `CV: '/cv'`.
- **Modify** `src/app/config/seo.ts` — `ROUTE_META[ROUTES.CV]`.
- **Modify** `src/app/App.tsx` — page lazy `Cv` + `<Route path={ROUTES.CV}>`.
- **Modify** `src/app/pages/APropos.tsx` — bouton CV → `<Link to={ROUTES.CV}>`
  actif (retrait de l'état « bientôt »/`aria-disabled`). Retirer l'usage de
  `cvSoon` (la clé peut rester inutilisée ou être supprimée du contenu).
- **Modify** `src/app/pages/APropos.test.tsx` — le test « bouton CV désactivé »
  devient « le bouton CV pointe vers /cv » (lien actif).
- **Modify** `src/app/pages/Cv` test — voir Tests.
- **Pas de nouvelle dépendance.**

## Accessibilité & perf

- Feuille = document sémantique : `<h1>` nom, `<h2>` sections (Expérience,
  Formation…). Photo `alt` (nom) une fois fournie ; placeholder `aria-hidden`.
- Bouton imprimer = vrai `<button>` ; masqué en impression.
- Contraste OK (noir sur blanc).
- Lien LinkedIn : tant que l'URL réelle est absente, ne pas rendre un lien mort
  (afficher le libellé sans `href`, ou pointer vers le vrai profil dès fourni).
- Budget ≤ 190 kB gzip ; page lazy (chunk séparé), aucune dépendance ajoutée.
- **Statique** : aucune animation (rien à couper en reduced-motion).

## Tests

- `Cv.content.ts` : parité FR/EN (mêmes longueurs expérience/formation/
  compétences), champs non vides ; `getCvContent('fr'|'en')` renvoie la bonne
  langue.
- `Cv.tsx` : rend `<h1>` « Alexis Kabiche », le titre, les 4 intitulés de poste,
  les sections (Expérience/Compétences/Formation), le bouton « Télécharger le
  PDF ». (Le déclenchement de `window.print` peut être vérifié via un mock.)
- `APropos.test.tsx` : le bouton CV est désormais un lien vers `/cv` (plus
  `aria-disabled`).
- `tsc` / Biome / build / tests / budget verts. Impression réelle relue (A4, 1
  page, langue FR **et** EN), rendu écran relu light **et** dark.

## Critères de réussite

- `/cv` affiche un CV A4 **1 page**, statique, style du site (monochrome,
  Bricolage+Manrope), **feuille blanche** sur fond thémé, **bilingue**. Le
  bouton « Télécharger le PDF » produit un **PDF A4 vectoriel** propre (chrome
  du site masqué). Le bouton « Voir le CV » de À propos mène à `/cv`. Contenu
  réel (parcours/formation) sans fausse information ; photo + LinkedIn en
  placeholder honnête jusqu'à fourniture. Gates verts ; impression relue FR/EN.
