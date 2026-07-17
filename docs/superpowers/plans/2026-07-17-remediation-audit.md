# Remédiation complète de l'audit — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger l'intégralité des findings de l'audit du 2026-07-17 (P0/P1/P2) : purge des dépendances et du code mort, TypeScript vérifié, 404 + SEO complet, formulaire fiable et protégé, accessibilité, performance (code-splitting, images, fonts), headers de sécurité.

**Architecture:** Travail séquentiel sur une branche dédiée `chore/remediation-audit`, en 11 tâches committées indépendamment. On purge d'abord (réduit la surface), on installe TypeScript ensuite (fiabilise tout le reste), puis on corrige par domaine. L'architecture de scroll « body scroller » est conservée (changement trop risqué sans test iOS manuel) mais ses bugs sont corrigés.

**Tech Stack:** React 18.3, Vite 6, TypeScript (à installer), Tailwind v4, react-router 7, motion, GSAP, ogl, EmailJS, @fontsource, Vitest.

## Global Constraints

- Réponses, textes UI, alt et aria en **français**.
- Aucune régression visuelle volontaire : les classes/styles existants sont conservés à l'identique sauf mention explicite (token `--portfolio-text-muted` clair).
- `npm run test` (55 tests) doit rester vert après **chaque** tâche ; `npm run build` aussi.
- Ne PAS toucher à l'architecture de scroll (`html fixed` / body scroller) — hors périmètre.
- Domaine canonique : `https://alexiskabiche.com`.
- Commits en français, préfixes conventionnels (`chore:`, `fix:`, `feat:`, `perf:`, `a11y:`, `seo:`, `sec:`).

---

### Task 1 : Branche + purge dépendances & code mort

**Files:**
- Delete: `src/app/components/ui/` (48 fichiers), `src/app/components/Button.tsx`, `Recommendations.tsx`, `PageHeader.tsx`, `layouts/PageLayout.tsx`, `common/FormField.tsx`, `common/ImageGallery.tsx`, `common/Lightbox.tsx`, `common/AnimatedSection.tsx`, `figma/ImageWithFallback.tsx`, `src/imports/svg-e6nmbfyqop.ts`, `src/imports/pasted_text/`, `src/app/data/experiences.ts`, `experiencesData.ts`, `testimonials.ts`, `src/app/hooks/useLightbox.ts`, `useForceBackdropFilter.ts`, `public/sounds/`
- Modify: `package.json` (deps + bloc `pnpm`), `vite.config.ts:27-35`, `src/app/hooks/index.ts`, `src/app/data/projetsData.ts:465-…` (exports morts), `src/app/pages/Projets.test.tsx` (mock PageHeader)

**Interfaces:**
- Produces: package.json avec 15 dépendances runtime exactement : `@emailjs/browser`, `@gsap/react`, `@vercel/analytics`, `@vercel/speed-insights`, `clsx`, `gsap`, `lucide-react`, `motion`, `ogl`, `react`, `react-dom`, `react-router`, `sonner`, `tailwind-merge`, `tw-animate-css`.

- [ ] **Step 1:** `git checkout -b chore/remediation-audit`
- [ ] **Step 2:** Supprimer les fichiers/dossiers listés ci-dessus (`git rm -r`).
- [ ] **Step 3:** `src/app/hooks/index.ts` → ne garder que `useEmailForm` + types.
- [ ] **Step 4:** `projetsData.ts` : supprimer `PROJETS_PRINCIPAUX_COUNT`, `projetsPrincipaux`, `autresProjets` (garder `projetsData`, `tousProjets`, `Projet`).
- [ ] **Step 5:** `Projets.test.tsx` : retirer le `vi.mock` de PageHeader (composant supprimé).
- [ ] **Step 6:** `package.json` : retirer les 51 deps mortes (16 jamais importées + 35 exclusives à `ui/` — `sonner` et `tw-animate-css` restent) et le bloc `pnpm.overrides`.
- [ ] **Step 7:** `vite.config.ts` : retirer l'alias `three` et `dedupe: ['three']` (garder l'alias `@`).
- [ ] **Step 8:** `npm install` (régénère package-lock).
- [ ] **Step 9:** Vérifier : `npx vitest run` → 14 fichiers verts ; `npm run build` → succès. Noter la nouvelle taille CSS/JS.
- [ ] **Step 10:** Commit `chore: purge 51 dépendances mortes et ~181 Ko de code inatteignable`

### Task 2 : TypeScript vérifié (tsconfig strict + typecheck au build)

**Files:**
- Create: `tsconfig.json`, `src/vite-env.d.ts`
- Modify: `package.json` (devDeps + scripts), fichiers source en erreur (au fil de `tsc`)

**Interfaces:**
- Produces: script `npm run typecheck` (= `tsc --noEmit`) ; `npm run build` = `tsc --noEmit && vite build`.

- [ ] **Step 1:** `npm i -D typescript @types/node @types/react @types/react-dom`
- [ ] **Step 2:** Créer `tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node", "vite/client", "vitest/globals"],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3:** Créer `src/vite-env.d.ts` :

```ts
/// <reference types="vite/client" />

declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
```

- [ ] **Step 4:** Scripts : `"typecheck": "tsc --noEmit"`, `"build": "tsc --noEmit && vite build"`.
- [ ] **Step 5:** `npm run typecheck` → corriger toutes les erreurs (attendues : `NodeJS.Timeout` → `ReturnType<typeof setTimeout>` dans Header/Shuffle, param `id` implicite any dans vite.config, `ref` inexistant dans les props de RollingText, variables inutilisées comme `getHeaderColor`…). Zéro erreur exigé.
- [ ] **Step 6:** `npx vitest run` + `npm run build` verts. Commit `chore: réintroduit TypeScript strict avec type-check au build`

### Task 3 : Routeur — 404, lazy loading, ErrorBoundary

**Files:**
- Create: `src/app/components/ErrorBoundary.tsx`
- Modify: `src/app/App.tsx`, `src/app/config/routes.ts`, `src/app/App.test.tsx`

**Interfaces:**
- Produces: `ErrorBoundary` (default export, props `{ children }`) ; routes lazy `Projets/ProjetDetail/APropos/Contact/NotFound` sous `<Suspense>`.

- [ ] **Step 1 (test d'abord):** Ajouter à `App.test.tsx` un test « une URL inconnue rend la page 404 » (render `AppContent` dans `MemoryRouter initialEntries={['/inexistant']}` + provider, `await screen.findByText('404')`). Lancer → FAIL.
- [ ] **Step 2:** `App.tsx` : `const Projets = lazy(() => import('./pages/Projets'))` (idem ProjetDetail, APropos, Contact, NotFound) ; `Home` reste statique ; envelopper `<Routes>` dans `<Suspense fallback={null}>` ; ajouter `<Route path="*" element={<NotFound />} />` ; retirer `future={{ v7_startTransition: true }}`.
- [ ] **Step 3:** Créer `ErrorBoundary.tsx` (class component, `getDerivedStateFromError`, message français + lien `<a href="/">Revenir à l'accueil</a>`, `role="alert"`) et envelopper le contenu de `App` avec.
- [ ] **Step 4:** `routes.ts` : supprimer `EXPERTISES` et `EXPERIENCES`.
- [ ] **Step 5:** Tests + build verts. Commit `fix: route 404, lazy loading par route et ErrorBoundary global`

### Task 4 : SEO dynamique — titre/description/canonical par page

**Files:**
- Create: `src/app/components/PageMeta.tsx`, `src/app/components/PageMeta.test.tsx`
- Modify: les 6 pages (`Home`, `Projets`, `ProjetDetail`, `APropos`, `Contact`, `NotFound`)

**Interfaces:**
- Produces: `PageMeta({ title, description?, path })` — met à jour `document.title`, `meta[name=description]`, `link[rel=canonical]`, `og:title/description/url`.

- [ ] **Step 1 (test d'abord):** `PageMeta.test.tsx` : render → `document.title` === titre passé ; meta description mise à jour. FAIL puis PASS.
- [ ] **Step 2:** Implémenter `PageMeta` (useEffect, `BASE_URL = 'https://alexiskabiche.com'`).
- [ ] **Step 3:** Intégrer : Home `Alexis Kabiche — Product & Brand Designer` `/` ; Projets `Projets — Alexis Kabiche` ; ProjetDetail `` `${projet.title} — Alexis Kabiche` `` + description projet ; APropos `À propos — Alexis Kabiche` ; Contact `Contact — Alexis Kabiche` ; NotFound `Page introuvable — Alexis Kabiche`.
- [ ] **Step 4:** Tests + build. Commit `seo: titre, description et canonical dynamiques par route`

### Task 5 : SEO statique — index.html, favicon, robots, sitemap, script thème externe

**Files:**
- Create: `public/theme-init.js`, `public/favicon.svg`, `public/apple-touch-icon.png`, `public/og-image.png`, `public/robots.txt`, `public/sitemap.xml`
- Modify: `index.html`, `src/test/index-meta.test.ts`, `src/main.tsx` (dédoublonnage init thème)

- [ ] **Step 1:** Déplacer le script inline de `index.html` vers `public/theme-init.js` (IIFE identique) ; `<script src="/theme-init.js"></script>` dans `<head>`. Supprimer le bloc d'init dupliqué de `main.tsx:6-12` (couvert par theme-init + AnimatedThemeToggler).
- [ ] **Step 2:** `index.html` : ajouter OG (`og:type=website`, `og:title`, `og:description`, `og:url`, `og:image=/og-image.png`, `og:locale=fr_FR`), Twitter (`summary_large_image`), `link rel=canonical`, `link rel=icon` (svg) + `apple-touch-icon`.
- [ ] **Step 3:** Générer `favicon.svg` (monogramme AK sombre), `apple-touch-icon.png` 180×180 et `og-image.png` 1200×630 via script PowerShell GDI+ (fond #121312, texte #EAEAEA).
- [ ] **Step 4:** `robots.txt` (Allow all + Sitemap) et `sitemap.xml` (14 URL : 4 pages + 10 projets, `lastmod` du jour).
- [ ] **Step 5:** Adapter `index-meta.test.ts` : l'assertion `isDark` lit désormais `public/theme-init.js` ; les assertions meta restent sur `index.html`. Tests + build. Commit `seo: meta sociales, favicon, robots.txt, sitemap.xml`

### Task 6 : Fonts self-hébergées

**Files:**
- Modify: `src/styles/fonts.css`, `package.json`

- [ ] **Step 1:** `npm i @fontsource/manrope @fontsource/playfair-display`
- [ ] **Step 2:** `fonts.css` : remplacer les 2 `@import url(googleapis)` par :

```css
@import '@fontsource/manrope/400.css';
@import '@fontsource/manrope/500.css';
@import '@fontsource/manrope/600.css';
@import '@fontsource/manrope/700.css';
@import '@fontsource/manrope/800.css';
@import '@fontsource/playfair-display/400.css';
@import '@fontsource/playfair-display/400-italic.css';
@import '@fontsource/playfair-display/700.css';
```

- [ ] **Step 3:** Build → vérifier la présence des woff2 dans `dist/assets` et l'absence de référence `googleapis`. Commit `perf: fonts auto-hébergées (fin du render-blocking Google Fonts + RGPD)`

### Task 7 : Formulaire contact fiable — feedback, honeypot, ARIA, vrais liens

**Files:**
- Create: `src/app/hooks/useEmailForm.test.ts`
- Modify: `src/app/hooks/useEmailForm.ts`, `src/app/pages/Contact.tsx`, `src/app/components/Header.tsx`, `src/app/components/ContactFooter.tsx`, `src/app/components/SuccessPopup.tsx`

**Interfaces:**
- Produces: `submitForm(formData: FormData, honeypot?: string): Promise<boolean>` — honeypot rempli ⇒ succès simulé sans envoi ; échec EmailJS ⇒ `toast.error(...)` + retour `false`.

- [ ] **Step 1 (tests d'abord):** `useEmailForm.test.ts` avec `vi.mock('@emailjs/browser')` et `vi.mock('sonner')` : (a) champs vides ⇒ erreurs + pas d'envoi ; (b) honeypot rempli ⇒ pas d'appel emailjs, retour true ; (c) rejet emailjs ⇒ `toast.error` appelé, retour false ; (d) succès ⇒ popup. FAIL.
- [ ] **Step 2:** Implémenter dans `useEmailForm.ts` (import `{ toast } from 'sonner'`). PASS.
- [ ] **Step 3:** `Contact.tsx` : champ honeypot caché (`name="site_web"`, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`, wrapper `position:absolute; left:-9999px`) transmis à `submitForm` ; supprimer le tableau `recommendations` (lignes 9-28) et la section « Références » (fictive) ; sur chaque champ : `required`, `aria-invalid={!!errors.x}`, `aria-describedby` vers le `<p id="erreur-x" role="alert">` ; remplacer `focus:outline-none` par `focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-card-focus)]`.
- [ ] **Step 4:** `Header.tsx` (desktop + menu mobile) et `ContactFooter.tsx` : les boutons `navigate('/contact')` deviennent des `<Link to="/contact">` avec les mêmes classes/styles.
- [ ] **Step 5:** `SuccessPopup.tsx` : `role="dialog"`, `aria-modal="true"`, `aria-labelledby` sur le h3, focus initial sur le bouton Fermer, restitution du focus à la fermeture.
- [ ] **Step 6:** Tests + build. Commit `fix: formulaire contact — feedback d'échec, honeypot anti-spam, ARIA, liens crawlables`

### Task 8 : Accessibilité structurelle & mouvement

**Files:**
- Modify: `src/app/App.tsx` (main + skip-link), `src/styles/index.css` (.skip-link), `src/styles/theme.css` (muted), `src/app/components/Header.tsx`, `Home.tsx`, `AnimatedThemeToggler.tsx`, `ScrollRevealTitle.tsx`, `RollingText.tsx`, `Shuffle.tsx`, `Grainient.tsx` (reduced only), `NotFound.tsx`, `ContactFooter.tsx`

- [ ] **Step 1:** App : `<a href="#contenu" className="skip-link">Aller au contenu</a>` avant le Header ; envelopper `<AppContent/>` dans `<main id="contenu">`. CSS `.skip-link` (hors écran, visible au focus).
- [ ] **Step 2:** Header : menus dans `<nav aria-label="Navigation principale">` ; burger avec `aria-label` dynamique, `aria-expanded`, `aria-controls="menu-mobile"` ; fermeture par Escape (useEffect keydown quand ouvert) ; items du menu mobile `<h1>` → `<span>` (mêmes classes) ; séparateur « | » `aria-hidden="true"`.
- [ ] **Step 3:** Home : `<h1 className="sr-only">Alexis Kabiche, Product & Brand Designer</h1>`.
- [ ] **Step 4:** AnimatedThemeToggler : sr-only français dynamique (`Activer le thème clair/sombre`).
- [ ] **Step 5:** `theme.css:22` → `--portfolio-text-muted: #6E6E6E;` (clair uniquement).
- [ ] **Step 6:** reduced-motion : `useReducedMotion()` dans ScrollRevealTitle (rendu direct sans blur/translate) et RollingText (texte statique) ; Shuffle : si `matchMedia('(prefers-reduced-motion: reduce)')` → pas de GSAP (texte brut) ; NotFound : conditionner les `repeat: Infinity` ; ContactFooter : `aria-hidden` sur le « CONTACT » décoratif.
- [ ] **Step 7:** Tests + build. Commit `a11y: landmarks, skip-link, ARIA menu, contraste AA, prefers-reduced-motion généralisé`

### Task 9 : Scroll & WebGL — bugs confirmés

**Files:**
- Create: `src/app/utils/scrollBodyTo.ts`, `src/app/utils/scrollBodyTo.test.ts`
- Modify: `src/app/pages/ProjetDetail.tsx`, `src/app/pages/APropos.tsx`, `src/app/components/Header.tsx` (scroll-lock), `src/styles/portfolio.css` (hack body[style]), `src/app/components/Grainient.tsx`, `src/app/components/ImageLightbox.tsx`

**Interfaces:**
- Produces: `scrollBodyTo(targetTop: number): () => void` — anime `document.body.scrollTop` (800 ms ease-in-out-cubic), saut instantané si reduced-motion, retourne une fonction d'annulation.

- [ ] **Step 1 (test d'abord):** test unitaire de `scrollBodyTo` (jsdom + rAF mocké) : reduced-motion ⇒ position immédiate ; annulation ⇒ plus d'écriture. FAIL puis PASS.
- [ ] **Step 2:** ProjetDetail : déplacer le `useEffect` (l.93) AVANT le early-return `Navigate` (l.42) ; remplacer la boucle rAF inline par `scrollBodyTo` (annulée à l'unmount) ; `useScroll({ container: bodyRef, target: heroRef, … })` avec `bodyRef = useRef(document.body)` pour que le zoom hero suive le vrai scroller ; galerie : image dans un `<button type="button">` ouvrant la lightbox (`setLightboxIndex(i); setLightboxOpen(true)`), `aria-label` français, `cursor-zoom-in`.
- [ ] **Step 3:** APropos : même remplacement `scrollBodyTo` (suppression du code dupliqué).
- [ ] **Step 4:** Header scroll-lock : sauvegarder `document.body.scrollTop` (pas `window.scrollY`), verrouiller via `overflow-y: hidden` sur body, restaurer `scrollTop` à la fermeture ; supprimer le hack `body[style*="position: fixed"]` de portfolio.css.
- [ ] **Step 5:** Grainient : init WebGL une seule fois (effet `[]`, refs pour program/renderer) ; un 2ᵉ effet met à jour les uniforms (couleurs/params) sans recréer le contexte ; cleanup avec `gl.getExtension('WEBGL_lose_context')?.loseContext()` ; si reduced-motion ⇒ rendu d'une seule frame (pas de boucle rAF).
- [ ] **Step 6:** ImageLightbox : `role="dialog"` `aria-modal="true"`, focus au montage + restitution au démontage, Escape/flèches au niveau document (useEffect), restauration `overflow` avec `''` (pas `'unset'`), alt français.
- [ ] **Step 7:** Supprimer `getHeaderColor` (Header) et la prop morte `stagger` (Shuffle + appels dans Home). Tests + build. Commit `fix: scroll factorisé et annulable, lock mobile réparé, WebGL sans recréation, lightbox activée`

### Task 10 : Performance images

**Files:**
- Modify: `src/app/pages/ProjetDetail.tsx` (galerie), `src/app/components/common/NewProjectCard.tsx`, `src/app/pages/Projets.tsx`
- Optionnel: recompression des webp > 300 Ko

- [ ] **Step 1:** Galerie ProjetDetail : `loading="lazy" decoding="async"` (remplace `eager`).
- [ ] **Step 2:** NewProjectCard : prop `priority?: boolean` → `loading={priority ? undefined : 'lazy'}` + `decoding="async"` ; Projets.tsx passe `priority={index < 2}` ; ProjetDetail (cartes « autres projets ») laisse lazy.
- [ ] **Step 3 (optionnel, si sharp-cli fonctionne):** recompresser `757ee99…webp` (877 Ko), `a2f33af…webp` (373 Ko), `83b3683…webp` (349 Ko) en qualité 80, dimensions conservées ; vérifier visuellement le poids < 250 Ko chacun ; sinon documenter.
- [ ] **Step 4:** Build : vérifier chunks par route + poids. Commit `perf: lazy-loading des images et priorisation above-the-fold`

### Task 11 : Sécurité + finitions + vérification finale

**Files:**
- Modify: `vercel.json`, `README.md`

- [ ] **Step 1:** `vercel.json` — ajouter :

```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
      { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.emailjs.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" }
    ]
  }
]
```

(CSP possible car : script thème externalisé Task 5, fonts self-hébergées Task 6, analytics Vercel servis en same-origin `/_vercel/*`, seul XHR externe = `api.emailjs.com`.)
- [ ] **Step 2:** README : stack réelle (retirer Three.js/R3F, ajouter TypeScript/typecheck), mention des scripts.
- [ ] **Step 3:** Vérification finale complète : `npm run typecheck` ✓ ; `npx vitest run` ✓ (suite enrichie) ; `npm run build` ✓ ; `npm audit` = 0 ; `vite preview` + requêtes sur `/`, `/projets`, `/projets/mauni`, `/apropos`, `/contact`, `/inexistant` (contenu + 200) ; comparer tailles bundle avant/après.
- [ ] **Step 4:** Commit `sec: headers de sécurité et CSP sur Vercel` puis commit final docs.

## Self-Review

- **Couverture spec :** P0-1 (Task 3), P0-2 (Tasks 4-5), P0-3 (Task 7), P1-1 (Task 2), P1-2 (Task 1), P1-3 (Task 3), P1-4 (Task 10), P1-5 (Task 6), P1-6/7 (Task 7), P1-8 (Task 9), P1-9 (Tasks 7-8), P1-10 (Task 11), P1-11 (Task 7), P2-1→8 (Tasks 1, 3, 8, 9, 11). Non couvert volontairement : refonte scroll window (dette de fond, risque iOS), découpage d'APropos en sous-composants (cosmétique, hors « code léger fonctionnel » minimal), dimensions width/height des images (nécessite pipeline de données dims — documenté).
- **Placeholders :** aucun TBD ; les corrections TS de Task 2 sont par nature itératives (`tsc` fait foi).
- **Cohérence types :** `submitForm(formData, honeypot?)` (Task 7) et `scrollBodyTo(targetTop): () => void` (Task 9) utilisés tels que définis.
