# Correctif Safari et titre mobile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurer l’animation mobile de `PRODUCT` tout en conservant le correctif desktop et améliorer l’intégration visuelle du hero avec le chrome Safari et le mode écran d’accueil.

**Architecture:** Le padding du masque devient une capacité opt-in de `Shuffle`, activée uniquement par le titre desktop concerné. Les métadonnées HTML fournissent le fallback Safari initial, puis `BackgroundWrapper` synchronise `theme-color` avec le thème React. Seule la couche graphique utilise `100lvh`; le contenu reste dimensionné en `100dvh`.

**Tech Stack:** React 18, TypeScript, GSAP SplitText, Vitest, Testing Library, CSS viewport units, métadonnées Safari/Apple.

---

### Task 1: Isoler le padding anti-clipping au desktop

**Files:**
- Modify: `src/app/components/Shuffle.test.ts`
- Modify: `src/app/components/Shuffle.tsx`
- Modify: `src/app/pages/Home.tsx`

- [ ] **Step 1: Écrire le test en échec**

Ajouter les attentes suivantes :

```ts
expect(getCharacterMaskPadding(150, false)).toBe(0);
expect(getCharacterMaskPadding(150, true)).toBe(6);
```

- [ ] **Step 2: Vérifier l’échec**

Run: `npm test -- --run src/app/components/Shuffle.test.ts`

Expected: FAIL car le second argument n’est pas encore pris en compte et le cas désactivé retourne `6`.

- [ ] **Step 3: Implémenter l’option ciblée**

Ajouter `useCharacterMaskPadding?: boolean`, désactivé par défaut, puis calculer :

```ts
export const getCharacterMaskPadding = (width: number, enabled = false) =>
  enabled ? Math.min(12, Math.max(4, width * 0.04)) : 0;
```

Quand la valeur vaut zéro, restaurer `margin: 0` et `padding: 0`. Passer `useCharacterMaskPadding` uniquement au `Shuffle` `PRODUCT` de la branche desktop dans `Home.tsx`.

- [ ] **Step 4: Vérifier le passage au vert**

Run: `npm test -- --run src/app/components/Shuffle.test.ts src/app/pages/Home.test.tsx`

Expected: PASS.

### Task 2: Intégrer le chrome Safari et l’overscan du fond

**Files:**
- Modify: `index.html`
- Modify: `src/app/App.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Écrire le test en échec**

Exporter un futur helper et attendre les deux couleurs :

```ts
expect(getSafariChromeColor(false)).toBe('#F2F2F2');
expect(getSafariChromeColor(true)).toBe('#111111');
```

- [ ] **Step 2: Vérifier l’échec**

Run: `npm test -- --run src/app/App.test.tsx`

Expected: FAIL car `getSafariChromeColor` n’existe pas encore.

- [ ] **Step 3: Implémenter la synchronisation et les métadonnées**

Ajouter dans `index.html` :

```html
<meta name="theme-color" content="#F2F2F2" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

Initialiser immédiatement la couleur dans le script de thème. Dans `BackgroundWrapper`, synchroniser ensuite la balise lors de chaque changement de `isDarkMode` avec `getSafariChromeColor`.

Dans `theme.css`, conserver `100dvh` pour `.home-section` et `.app-container`, mais définir la couche graphique ainsi :

```css
.grainient-wrapper {
  height: 100vh;
  height: 100lvh;
  min-height: 100dvh;
}
```

- [ ] **Step 4: Vérifier le passage au vert et les métadonnées**

Run: `npm test -- --run src/app/App.test.tsx`

Expected: PASS.

Run: `rg -n "theme-color|apple-mobile-web-app|100lvh" index.html src/styles/theme.css`

Expected: les trois métadonnées et `100lvh` sont présents.

### Task 3: Validation intégrée et livraison

**Files:**
- Verify: all modified files

- [ ] **Step 1: Lancer la suite complète**

Run: `npm test -- --run`

Expected: tous les tests passent.

- [ ] **Step 2: Construire la production**

Run: `npm run build`

Expected: build Vite réussi.

- [ ] **Step 3: Vérifier le diff et le navigateur**

Run: `git diff --check`

Expected: aucune sortie.

Contrôler à 390 × 844 que le titre mobile ne montre plus de fragment dupliqué et que la page ne scrolle pas ; contrôler à 1440 × 900 que le « o » desktop reste entier.

- [ ] **Step 4: Committer et pousser**

```bash
git add index.html src/app/App.tsx src/app/App.test.tsx src/app/components/Shuffle.tsx src/app/components/Shuffle.test.ts src/app/pages/Home.tsx src/styles/theme.css docs/superpowers/plans/2026-07-16-correctif-safari-titre-mobile.md
git commit -m "fix: restore mobile title and improve Safari chrome"
git push origin main
```

