# Ajout de 4 projets au portfolio

**Date :** 2026-07-16
**Statut :** Validé

## Objectif

Ajouter 4 projets (Mauni, Onboarding RH, SYMA, Trackit) aux cartes du portfolio.
Le contenu textuel est provisoire (placeholder) — seuls les images et les titres
sont définitifs. Le vrai contenu sera rédigé plus tard.

## Contexte technique

- Les projets sont définis dans un unique tableau `projetsData` :
  `src/app/data/projetsData.ts`. Ajouter un objet `Projet` alimente
  automatiquement les cartes de la page `/projets` **et** la page de détail
  `/projets/:id` (hero plein écran + galerie). Aucun composant à modifier.
- Chaque `Projet` a une image `image` (hero) et un tableau `gallery[]`
  (= les « images à intégrer »).
- Les images sont importées via l'alias Vite `figma:asset/<fichier>`, résolu
  vers `src/assets/<fichier>` (voir `vite.config.ts`).
- Le projet standardise les images en **WebP** (commit récent PNG→WebP, −94 %).

## Décisions

- **Ordre :** les 4 nouveaux projets sont **préfixés en tête** du tableau →
  cartes 001→004 ; les 6 projets existants passent 005→010.
- **Texte :** structure complète remplie de placeholder FR, chaque champ texte
  préfixé « *[Texte provisoire]* » pour repérage/remplacement facile.
- **Année :** `"2025"` comme placeholder.

## Pipeline images

`sharp` n'est pas installé (aucune dépendance image aujourd'hui). Approche
ponctuelle :

1. Installer `sharp` en devDependency.
2. Script de conversion : pour chaque image source (OneDrive), redimensionner à
   **max 2000 px de large**, convertir en **WebP qualité 82**, écrire dans
   `src/assets/`.
3. Désinstaller `sharp` → `package.json` / lockfile reviennent propres.

### Correspondance des fichiers

| Projet | id | Hero (`image`) | Galerie (`gallery`) |
|---|---|---|---|
| Mauni | `mauni` | `mauni-hero.webp` | `mauni-onboarding.webp`, `mauni-light.webp`, `mauni-dark.webp` |
| Onboarding RH | `onboarding-rh` | `onboarding-rh-hero.webp` | `onboarding-rh-admin.webp`, `onboarding-rh-arrivant.webp` |
| SYMA | `syma` | `syma-hero.webp` | `syma-screens.webp` |
| Trackit | `trackit` | `trackit-hero.webp` | `trackit-screens.webp` |

### Sources (OneDrive `…/Perso/Portfolio/`)

- Mauni : `mauni/Mockup Mauni.jpg` · `MAUNI onboarding.jpg` · `MAUNI light.jpg` · `MAUNI dark.jpg`
- Onboarding RH : `Onboarding RH/mockup onboarding RH.jpg` · `Onboarding Admin.jpg` · `Onboarding arrivant.jpg`
- SYMA : `SYMA/Mockup SYMA.jpg` · `SYMA.jpg`
- Trackit : `Trackit/mockup Trackit.jpg` · `TrackIT mockup.jpg`

## Champs des objets `Projet`

- **Réels :** `id`, `title`, `image`, `gallery`.
- **Placeholder :** `subtitle`, `description`, `tags`, `contexte`,
  `problematique`, `role`, `interventions`, `demarche` (4 étapes), `impact`,
  `natureProduit`, `year: "2025"`.

## Vérification

- `npm run build` (typecheck + bundle) sans erreur.
- `npm test` vert.
- Lancement `npm run dev` : les 4 cartes s'affichent en tête de `/projets`, et
  une page détail (hero + galerie) rend correctement.
