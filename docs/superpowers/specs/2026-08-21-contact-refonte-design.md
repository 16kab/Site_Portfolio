# Page « Contact » — refonte bespoke + section « Références »

**Date :** 2026-08-21 · **Statut :** design validé (brainstorming)

## Objectif

Refondre la page `/contact` en une page **bespoke cohérente avec « À propos »**
(paire de « pages perso »), et y ajouter une **section Références** : un
témoignage **rotatif**, **centré, purement typographique, sans photo**. On
**garde intégralement la mécanique du formulaire** (validation, envoi email,
honeypot, RGPD, popup succès) ; c'est la mise en page et la direction visuelle
qui changent, plus le nouveau bloc social-proof.

## Décisions validées (brainstorming)

1. **Ampleur** = refonte visuelle complète (comme À propos), mais la logique du
   formulaire (`useEmailForm`, validation, honeypot, popup) est **conservée**.
2. **Références** = témoignage rotatif, **citation centrée pleine largeur, pur
   typographique, AUCUNE photo**.
3. **Typo hero** = **Bricolage Grotesque** (`--font-manifeste`, déjà présente),
   pour l'accorder à la page À propos. Corps en **Manrope**.
4. **Palette** = **monochrome**, tokens `--portfolio-*`, theme-aware (aucun
   accent inventé).
5. **Placement** = Références **entre le hero et le formulaire** (rassurer avant
   d'inviter au contact).
6. **Rotation** = **manuelle** (points + clic « suivant »), pas d'auto-défilement.
7. **Contenu témoignages** = **placeholder neutre** pour l'instant :
   **aucun faux nom de personne, aucune fausse recommandation attribuée à une
   vraie entreprise**. Attributions génériques (rôle + secteur), clairement
   « exemple », à remplacer par de vraies références nommées quand l'utilisateur
   les fournira.

## Contrainte d'intégrité (bloquante)

Le composant d'origine fourni contenait de **faux témoignages** (noms + vraies
entreprises inventés). **Interdit en prod** : le portfolio est public et réel.
Le placeholder livré ne doit contenir **ni nom de personne réel/inventé, ni nom
d'entreprise réelle** présenté comme une recommandation. Format placeholder
autorisé : citation générique + **rôle générique** (+ secteur générique),
lisible comme un gabarit. Le remplacement par de vraies références est un simple
échange de données (voir « Données »).

## État existant (repères)

- `src/app/pages/Contact.tsx` : page actuelle. Header (eyebrow `Contact` + h1
  `Travaillons ensemble`), grille 2 colonnes : infos (`ContactInfo` :
  localisation/email/téléphone via `SITE_CONTACT`, `CONTACT_EMAIL_HREF`) +
  formulaire. Bilingue via objet `STRINGS` (FR/EN) + `useT`. Styles inline
  Manrope + tokens. `useEmailForm()` gère erreurs/soumission/popup.
  `SuccessPopup`, `PageMeta`, `RollingText`, `ScrollRevealTitle`/`ScrollFadeIn`.
- `src/styles/fonts.css` : `--font-manifeste` (Bricolage Grotesque) déjà définie.
- Tokens : `--portfolio-bg`, `--portfolio-text-primary/secondary/muted`,
  `--portfolio-card-bg`, `--portfolio-card-border`, `--portfolio-card-focus`.
- **motion/react** (jamais `framer-motion`). Tailwind v4 CSS (**pas shadcn** :
  ne pas créer `/components/ui`, ne pas mapper `bg-background`/
  `text-muted-foreground` — utiliser les tokens `--portfolio-*`).
- Route `/contact` lazy-loadée, couverte par la transition « voile ».

## Structure de la page (haut → bas)

### 1. Hero

- Eyebrow `Contact` / `Contact` (label discret Manrope, tracké).
- **Titre géant** `Travaillons ensemble` / `Let's work together` en
  **Bricolage Grotesque** (`var(--font-manifeste)`), `clamp` ample,
  `letter-spacing` serré, `text-wrap: balance`, couleur `--portfolio-text-primary`.
- Révélation à l'ouverture via `ScrollRevealTitle` (eyebrow → titre).

### 2. Références (nouveau)

Composant **`ContactReferences`** — adaptation du `split-testimonial` fourni,
**sans la colonne image**, en langage du site :

- **Label de section** discret : `(références)` / `(references)`.
- **Company/contexte** : petit label espacé au-dessus de la citation (rôle ou
  secteur générique en placeholder), animé au changement.
- **Citation** : `<blockquote>` **grand**, centré, `max-width` lisible (~24-28
  mots de large), Manrope 300/400, `clamp(1.5rem … 2.5rem)`,
  `color: --portfolio-text-primary`. Transition fondu + léger `y`/`blur` via
  `motion/react` (`AnimatePresence mode="wait"`).
- **Auteur** : `Rôle · Secteur` (placeholder) sous la citation, Manrope, muted.
  (Quand réel : `Prénom Nom · Rôle · Entreprise`.)
- **Index** : `01 / 04` (numérotation, muted).
- **Navigation** : rangée de **points** (boutons, `aria-label` « aller au
  témoignage N ») + un bouton **« Suivant »** (avec `ArrowUpRight` lucide).
  **Rotation manuelle uniquement.** Pas de gros `<div onClick>` : les contrôles
  sont de vrais `<button>` (a11y).
- **Accessibilité** : conteneur de citation `aria-live="polite"` ; point actif
  `aria-current`. Transitions coupées si `prefers-reduced-motion`.
- **Monochrome** : uniquement tokens `--portfolio-*`. Aucune couleur en dur,
  aucun token shadcn.

### 3. Formulaire + infos

- **Mécanique inchangée** : `useEmailForm`, `handleSubmit`, honeypot,
  messages d'erreur, `SuccessPopup`, note RGPD, `RollingText` sur le bouton.
- **Re-mise en page** : conserver la grille infos + formulaire (2 colonnes
  desktop, empilé mobile), harmonisée avec la nouvelle hiérarchie (titres de
  section, espacements). Les libellés/placeholders/erreurs FR/EN de `STRINGS`
  sont **réutilisés verbatim** (aucune régression de contenu ni d'a11y).

## Données (témoignages)

Type et emplacement pour un remplacement trivial :

```ts
export interface Reference {
  id: number;
  quote: { fr: string; en: string };
  // Placeholder : rôle/secteur génériques, PAS de nom réel ni d'entreprise réelle.
  // Réel (plus tard) : renseigner name + role + company.
  name?: string;          // ex. 'Prénom Nom' (absent en placeholder)
  role: { fr: string; en: string };     // ex. 'Direction Produit'
  company?: { fr: string; en: string }; // ex. secteur générique en placeholder
}
```

- **Placeholder livré** : 3 entrées, attributions **génériques** (rôle +
  secteur), citations neutres décrivant un travail de designer produit/brand.
  Exemple d'attribution acceptable : `Direction Produit · SaaS B2B`,
  `Fondatrice · Association`, `Lead Design · Studio`. **Aucun** nom de personne,
  **aucune** entreprise réelle.
- Parité **FR/EN** obligatoire (comme tout le contenu du site).
- Remplacement futur = éditer ce tableau (ajouter `name`, vrais `company`).

## Traitement visuel (bespoke, monochrome)

- Fond `--portfolio-bg`, `min-h-screen`, padding haut `--page-padding-top`.
- Hero en Bricolage ; sections en Manrope + labels tracké discrets (langage
  « À propos »). Conteneur `max-w-[1920px]` + paddings responsives comme
  l'existant.
- Séparations par **filets fins** (`--portfolio-card-border`) entre hero /
  références / formulaire pour rythmer la page.
- Signature de la page = le **bloc citation centré** en grand, respirant, qui
  tranche avec la densité du formulaire juste en dessous.

## Motion

- Hero : révélation douce (`ScrollRevealTitle`/`ScrollFadeIn`).
- Références : transition de citation (fondu + `y`/`blur`) via `motion/react`,
  `AnimatePresence mode="wait"`, coupée en reduced-motion.
- La page entre/sort via la **transition voile** déjà en place.

## Composants & fichiers

- **Create** `src/app/components/ContactReferences.tsx` — le carrousel de
  témoignages (présentational + état d'index interne), monochrome, Manrope,
  `motion/react`, sans photo. Exporte `ContactReferences` (default ou nommé) et
  le type `Reference` + les données placeholder (ou via un fichier data dédié —
  choix laissé au plan).
- **Create** test du composant : rendu de la 1re citation, navigation (clic
  « suivant » / point → change l'index), pas de balise `<img>`, parité FR/EN
  des données placeholder (même nombre d'entrées, `quote.fr`/`quote.en` non
  vides).
- **Modify** `src/app/pages/Contact.tsx` — hero Bricolage, insertion de
  `<ContactReferences />` entre hero et formulaire, re-mise en page ; **la
  mécanique `useEmailForm`/`handleSubmit`/honeypot/popup reste identique**.
- **Modify** test de page Contact si présent (sinon en ajouter un léger) :
  présence du h1, présence de la section références, formulaire toujours rendu
  (champs nom/prénom/email/objet/message), pas de `<img>` dans les références.
- `PageMeta` / `ROUTE_META[ROUTES.CONTACT]` conservés (SEO inchangé).
- **Pas de nouvelle dépendance** : `lucide-react` et `motion/react` déjà là ;
  Bricolage déjà importée.

## Accessibilité & perf

- Hiérarchie : hero `<h1>`, titres de section `<h2>`/labels.
- Contrôles du carrousel = vrais `<button>` avec `aria-label` ; citation en
  `aria-live="polite"` ; point actif `aria-current`.
- Formulaire : **aucune régression** (labels, `aria-invalid`, `role="alert"`,
  honeypot, focus visible conservés).
- `prefers-reduced-motion` respecté.
- Budget bundle **≤ 190 kB gzip** (chunk d'entrée) ; pas de nouvelle dépendance.

## Tests

- Références : 1re citation rendue ; clic « suivant » et clic point changent la
  citation affichée ; **aucune balise `<img>`** ; données placeholder FR/EN de
  même longueur, non vides ; placeholder **sans `name`** (garde-fou anti fausse
  identité).
- Page : `<h1>` « Travaillons ensemble » présent ; section références présente ;
  les 5 champs du formulaire (nom, prénom, email, objet, message) toujours
  rendus ; `PageMeta` monté.
- `tsc` / Biome / build / tests / budget verts. Rendu relu light **et** dark,
  desktop **et** mobile.

## Critères de réussite

- Page Contact refondue, cohérente avec À propos (hero Bricolage, monochrome
  theme-aware), avec une section Références en citation centrée typographique
  **sans photo**, rotation manuelle accessible. **Le formulaire fonctionne
  exactement comme avant.** Le placeholder témoignages ne contient **aucune
  fausse identité** et est trivial à remplacer par de vraies références. Gates
  verts, rendu relu light/dark + desktop/mobile.
