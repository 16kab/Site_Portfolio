# Mise à jour des captures Mauni — Design

**Date :** 2026-07-23
**Composant :** `src/app/pages/MauniShowcase.tsx` (+ `.css` inchangé)
**Statut :** design validé, en attente de relecture du spec

## Contexte & objectif

Les captures d'écran de l'app Mauni affichées dans le showcase du portfolio sont
obsolètes. L'utilisateur a fourni 7 nouveaux écrans (clair + sombre) dans
`C:\Users\alexis.kabiche\OneDrive - SPVIE\Bureau\Dossiers\Perso\Portfolio\mauni`.

Le jeu d'écrans a évolué : écran **Transactions** ajouté, écran **Budget** scindé
en deux vues (Budget / Répartition), écrans **Paramètres → Réglages** et
**Objectifs → Épargne** renommés, et les écrans autrefois isolés « Catégories »
n'existent plus en tant que tels. Ce n'est donc pas un simple remplacement
fichier-pour-fichier : il faut re-mapper la galerie et les sections dédiées.

Objectif : intégrer les nouvelles captures dans le showcase, en WebP, avec le
mode clair/sombre pour tous les écrans de la galerie.

## Décisions (validées)

1. **Mode sombre** : activé pour **les 6 écrans** de la galerie « Écrans »
   (auparavant seuls Budget + Répartition l'avaient).
2. **Copie narrative** : **inchangée**. On ne touche pas aux leads (« Douze
   catégories… », « Dix-huit écrans… ») ni aux chiffres décoratifs du bandeau
   solde animé (266,84 € / 2 400 / 1 500,30). Seules les images changent.
3. **Image hero** : **conservée** (`mauni-hero.webp`). Le `Mockup Mauni.jpg` et le
   PSD du dossier source ne sont pas utilisés.

## Inventaire & mapping des assets

Résolveur Vite : `figma:asset/<nom>.webp` → `src/assets/<nom>.webp`
(cf. `vite.config.ts`, `figmaAssetResolver`). `assetsInlineLimit: 0`.

Source (PNG, 1290×2796) → cible (WebP dans `src/assets/`) :

| Fichier source | Cible WebP | Écran |
|---|---|---|
| `Accueil_light.png` | `mauni-app-accueil.webp` | Accueil |
| `Accueil_dark.png` | `mauni-app-accueil-dark.webp` | Accueil (sombre) |
| `Transaction_light.png` | `mauni-app-transactions.webp` | Transactions |
| `Transaction_dark.png` | `mauni-app-transactions-dark.webp` | Transactions (sombre) |
| `Budget 1_light.png` | `mauni-app-budget.webp` | Budget |
| `Budget 1_dark.png` | `mauni-app-budget-dark.webp` | Budget (sombre) |
| `Budget2_light.png` | `mauni-app-repartition.webp` | Répartition (l'anneau) |
| `Budget 2_dark.png` | `mauni-app-repartition-dark.webp` | Répartition (sombre) |
| `Previsionnel_light.png` | `mauni-app-previsionnel.webp` | Prévisionnel |
| `Previsionnel_dark.png` | `mauni-app-previsionnel-dark.webp` | Prévisionnel (sombre) |
| `Epargne_light.png` | `mauni-app-epargne.webp` | Épargne |
| `reglages_light.png` | `mauni-app-reglages.webp` | Réglages |
| `reglages_dark.png` | `mauni-app-reglages-dark.webp` | Réglages (sombre) |

> ⚠️ Les noms sources sont irréguliers (`Budget 1_light` mais `Budget2_light`,
> espaces variables) → le script utilise une **table de correspondance explicite**,
> pas un glob/regex naïf.
>
> `Epargne_dark.png` n'est **pas** converti : la section 05 (Épargne) est une image
> unique en clair, sans toggle. (À reconvertir si on ajoute un dark là plus tard.)

**Assets orphelins à supprimer** de `src/assets/` (plus référencés après remap) :
`mauni-app-categories.webp`, `mauni-app-objectifs.webp`, `mauni-app-parametres.webp`.

## Conversion PNG → WebP

Aucun outil de conversion présent (pas d'ImageMagick/cwebp/sharp ; le `convert`
système est celui de Windows, sans rapport). Node est disponible.

- Ajouter **`sharp`** en `devDependencies` (`npm install -D sharp`).
- Créer un script committé **`scripts/convert-mauni-assets.mjs`** :
  - table de correspondance explicite (ci-dessus) ;
  - lit les PNG dans le dossier source OneDrive ;
  - écrit les WebP dans `src/assets/` ;
  - largeur conservée (1290 px, retina), qualité WebP ~80 ;
  - log de chaque conversion (source → cible, taille avant/après).

Choix délibéré : script réutilisable + dépendance dev assumée (les futurs
rafraîchissements de captures repasseront par là). Alternative écartée :
`npm install --no-save` (non reproductible).

## Modifications du composant `MauniShowcase.tsx`

### Imports (bloc lignes 10-18)
Remplacer par les 13 imports correspondant au nouveau jeu :

```ts
import accueil from 'figma:asset/mauni-app-accueil.webp';
import accueilDark from 'figma:asset/mauni-app-accueil-dark.webp';
import transactions from 'figma:asset/mauni-app-transactions.webp';
import transactionsDark from 'figma:asset/mauni-app-transactions-dark.webp';
import budget from 'figma:asset/mauni-app-budget.webp';
import budgetDark from 'figma:asset/mauni-app-budget-dark.webp';
import repartition from 'figma:asset/mauni-app-repartition.webp';
import repartitionDark from 'figma:asset/mauni-app-repartition-dark.webp';
import previsionnel from 'figma:asset/mauni-app-previsionnel.webp';
import previsionnelDark from 'figma:asset/mauni-app-previsionnel-dark.webp';
import epargne from 'figma:asset/mauni-app-epargne.webp';
import reglages from 'figma:asset/mauni-app-reglages.webp';
import reglagesDark from 'figma:asset/mauni-app-reglages-dark.webp';
```

(`categories`, `parametres`, `objectifs` supprimés ; `objectifs` → `epargne`.)

### `GALLERY` (lignes 93-100) — 6 écrans, tous avec dark
Ordre = navigation de l'app (Accueil · Transactions · Budget · Répartition ·
Prévisionnel · Réglages) :

```ts
const GALLERY = [
  { src: accueil, dark: accueilDark },
  { src: transactions, dark: transactionsDark },
  { src: budget, dark: budgetDark },
  { src: repartition, dark: repartitionDark },
  { src: previsionnel, dark: previsionnelDark },
  { src: reglages, dark: reglagesDark },
];
```

Le mécanisme clair/sombre (`.lyr.l`/`.lyr.d`, `applyMode`) est déjà générique :
fournir un `dark` par écran suffit, aucun changement CSS ni JS de logique.

### Légendes de galerie `screens[]` (FR lignes 49-56, EN 82-89)
Aligner les libellés sur le nouveau jeu. Les 4 écrans repris gardent leur légende
d'origine (respect de « copie inchangée ») ; seuls **Transactions** (nouveau) et
**Réglages** (ex-Paramètres) changent :

FR :
```ts
screens: [
  { b: 'Accueil', r: " — le solde, la vue d'ensemble" },
  { b: 'Transactions', r: ' — chaque opération, catégorisée' },
  { b: 'Budget', r: ' — suivi par catégorie' },
  { b: 'Répartition', r: " — l'anneau des dépenses" },
  { b: 'Prévisionnel', r: ' — anticiper la fin de mois' },
  { b: 'Réglages', r: ' — sobre, sans détour' },
],
```

EN (miroir) :
```ts
screens: [
  { b: 'Home', r: ' — balance, the big picture' },
  { b: 'Transactions', r: ' — every operation, categorised' },
  { b: 'Budget', r: ' — tracking by category' },
  { b: 'Breakdown', r: ' — the spending ring' },
  { b: 'Forecast', r: ' — anticipate month-end' },
  { b: 'Settings', r: ' — plain, no detours' },
],
```

> Ces légendes suivent les images (une capture Transactions ne peut pas être
> légendée « Catégories ») : elles font partie du mapping, pas de la copie
> narrative laissée intacte.

### Section 05 (Objectifs)
`objectifs` → `epargne` dans l'import et l'usage (ligne ~591). `alt` passe de
« Mauni — objectifs » à **« Mauni — épargne »** (cohérence avec l'asset).

### Section 04 (Répartition)
Utilise déjà `repartition` (ligne ~578), qui pointe désormais vers la nouvelle
capture Répartition. Aucun changement de code (variable réutilisée).

## Ce qui reste intact

- Leads narratifs (`s1lead`…`s5lead`), notes, bandeau solde animé et ses chiffres.
- Labels de navigation `nav` (« Écrans », « Répartition », « Objectifs » —
  « Objectifs » reste valide, c'est le nom de l'onglet dans l'écran Plan).
- Image hero (`projet.image` = `mauni-hero.webp`), `projetsData.ts`, `projet.gallery`.
- Toute la logique JS (illumination, scroll-spy, galerie épinglée, compteur, zoom).
- CSS.

## Hors périmètre

- Rédaction du contenu texte « provisoire » de l'entrée Mauni dans `projetsData.ts`.
- Mockups / vidéos Higgsfield (bloqués par crédits, autre chantier).
- Toute refonte visuelle du composant.

## Vérification

1. `scripts/convert-mauni-assets.mjs` produit 13 WebP dans `src/assets/` (log OK).
2. Build (`npm run build`) sans erreur (imports résolus, pas d'asset manquant).
3. Lint/typecheck (Biome + `tsc`) OK — pas d'import inutilisé.
4. Contrôle visuel : `npm run dev` → page projet Mauni :
   - galerie « Écrans » : 6 écrans dans le bon ordre, légendes correctes ;
   - toggle ☀/☾ bascule bien les 6 écrans ;
   - sections 04 (Répartition) et 05 (Épargne) affichent les bonnes captures ;
   - hero inchangé.
5. Aucun fichier orphelin restant (`categories`/`objectifs`/`parametres` supprimés).
