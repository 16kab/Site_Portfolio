# Refonte page « À propos » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre `/apropos` en page courte « manifeste + index » (pourquoi/comment), monochrome, accroche en Bricolage Grotesque, blocs concrets conservés, parcours renvoyé au futur CV.

**Architecture:** Le contenu bilingue (FR canonique + EN) est extrait dans un module dédié `APropos.content.ts` (testable, parité garantie). La page `APropos.tsx` est réécrite pour consommer ce module et rendre un hero manifeste (accroche géante + portrait placeholder) suivi d'un corps « index » (Philosophie en exergue, puis 3 sous-blocs numérotés). Le menu sticky scrollspy et les cartes `InfoCard`/`CardCarousel` sont supprimés. Une police display (Bricolage Grotesque) est ajoutée via `@fontsource`.

**Tech Stack:** React 19 + Vite + TypeScript ; Tailwind v4 (config CSS) ; `motion/react` ; react-router v7 ; Vitest + @testing-library/react ; Biome ; polices self-hosted `@fontsource`.

**Spec:** docs/superpowers/specs/2026-08-20-apropos-refonte-design.md

## Global Constraints

- **Bilingue obligatoire** : tout texte existe en FR **et** EN, avec le **même nombre d'items** dans les deux langues (5 expertises / 4 principes / 3 recherche). FR est la version canonique.
- **Monochrome** : uniquement les tokens `--portfolio-*` existants (aucune couleur codée en dur, aucun accent inventé). Theme-aware light/dark via ces tokens.
- **Import motion** : toujours `from 'motion/react'`, jamais `framer-motion`.
- **Scroll** : `document.body.scrollTop` (jamais `window.scroll*`).
- **Alias** : `@/*` → `./src/*` ; `cn` depuis `@/lib/utils` si besoin.
- **Budget bundle ≤ 190 kB gzip** (chunk d'entrée) ; la police est un asset séparé.
- **Pas de lien mort** : le bouton CV ne navigue nulle part tant que `/cv` n'existe pas.
- **Réutiliser verbatim** les textes FR/EN existants de `APropos.tsx` (philosophie, expertises, principes, et les 3 items recherche retenus) — ne pas réécrire ce contenu.
- Chaque tâche finit par : `npx vitest run <fichier de test>` vert, puis un commit.

---

## File Structure

- **Create** `src/app/pages/APropos.content.ts` — contenu bilingue typé (strings, expertises×5, principes×4, recherche×3) + `getAproposContent(lang)`. Responsabilité unique : le contenu.
- **Create** `src/app/pages/APropos.content.test.ts` — parité FR/EN + items retenus.
- **Modify** `src/app/pages/APropos.tsx` — réécriture complète de la structure (manifeste + index), consomme le module contenu, supprime scrollspy + InfoCard/CardCarousel.
- **Create** `src/app/pages/APropos.test.tsx` — rendu (accroche, comptes, item retiré absent, bouton CV désactivé, plus de scrollspy).
- **Modify** `src/styles/fonts.css` — import `@fontsource/bricolage-grotesque` + variable `--font-manifeste`.
- **Modify** `package.json` / lockfile — dépendance `@fontsource/bricolage-grotesque`.

---

## Task 1: Module de contenu bilingue

**Files:**
- Create: `src/app/pages/APropos.content.ts`
- Test: `src/app/pages/APropos.content.test.ts`

**Interfaces:**
- Consumes: rien (données pures).
- Produces :
  - `interface ExpertiseItem { number: string; title: string; description: string; badges: string[] }`
  - `interface IndexItem { number: string; title: string; description: string }`
  - `interface AproposStrings { eyebrow: string; accroche: string; whyLabel: string; philosophieP1: string; philosophieP2: string; expertiseLabel: string; expertiseTitle: string; principesLabel: string; principesTitle: string; rechercheLabel: string; rechercheTitle: string; cvButton: string; cvSoon: string }`
  - `expertisesFr/expertisesEn: ExpertiseItem[]` (5) ; `principlesFr/principlesEn: IndexItem[]` (4) ; `rechercheFr/rechercheEn: IndexItem[]` (3) ; `stringsFr/stringsEn: AproposStrings`
  - `function getAproposContent(lang: 'fr' | 'en'): { strings: AproposStrings; expertises: ExpertiseItem[]; principles: IndexItem[]; recherche: IndexItem[] }`

- [ ] **Step 1: Écrire le test qui échoue**

Créer `src/app/pages/APropos.content.test.ts` :

```ts
import { expect, it } from 'vitest';
import {
  getAproposContent,
  expertisesFr,
  expertisesEn,
  principlesFr,
  principlesEn,
  rechercheFr,
  rechercheEn,
} from './APropos.content';

it('parité FR/EN : 5 expertises, 4 principes, 3 recherche', () => {
  expect(expertisesFr).toHaveLength(5);
  expect(expertisesEn).toHaveLength(5);
  expect(principlesFr).toHaveLength(4);
  expect(principlesEn).toHaveLength(4);
  expect(rechercheFr).toHaveLength(3);
  expect(rechercheEn).toHaveLength(3);
});

it('recherche condensé = Impact / Collaboration / Maturité', () => {
  expect(rechercheFr.map((r) => r.title)).toEqual([
    'Impact plutôt que production',
    'Collaboration réelle',
    'Maturité design',
  ]);
});

it('getAproposContent renvoie la langue demandée', () => {
  expect(getAproposContent('fr').strings.accroche).toMatch(/sans moi/);
  expect(getAproposContent('en').strings.accroche).toMatch(/without me/);
  expect(getAproposContent('en').recherche.map((r) => r.title)).toEqual([
    'Impact over output',
    'Real collaboration',
    'Design maturity',
  ]);
});
```

- [ ] **Step 2: Lancer le test — il échoue**

Run: `npx vitest run src/app/pages/APropos.content.test.ts`
Expected: FAIL (module `./APropos.content` introuvable).

- [ ] **Step 3: Écrire le module de contenu**

Créer `src/app/pages/APropos.content.ts`. Les textes FR/EN des expertises et principes sont **repris verbatim** de l'ancien `APropos.tsx` ; recherche = 3 items retenus (Impact / Collaboration / Maturité), renumérotés `001/002/003`.

```ts
export interface ExpertiseItem {
  number: string;
  title: string;
  description: string;
  badges: string[];
}

export interface IndexItem {
  number: string;
  title: string;
  description: string;
}

export interface AproposStrings {
  eyebrow: string;
  accroche: string;
  whyLabel: string;
  philosophieP1: string;
  philosophieP2: string;
  expertiseLabel: string;
  expertiseTitle: string;
  principesLabel: string;
  principesTitle: string;
  rechercheLabel: string;
  rechercheTitle: string;
  cvButton: string;
  cvSoon: string;
}

// ── FR (canonique) ──────────────────────────────────────────────
export const expertisesFr: ExpertiseItem[] = [
  {
    number: '001',
    title: 'UX & Product Design',
    description:
      "Transformer des problématiques floues en interfaces claires et structurées. Intervention sur l'ensemble du cycle produit, de la phase de découverte aux interactions finalisées, avec une attention constante portée aux usages réels.",
    badges: [
      'Conception produit de bout en bout',
      'Workflows complexes',
      'Multi-plateforme',
      "Design d'interaction",
      'Prototypage',
      'Parcours utilisateurs',
    ],
  },
  {
    number: '002',
    title: 'Brand & Visual Design',
    description:
      "Construire et faire évoluer des identités visuelles cohérentes, pensées pour s'intégrer dans des environnements produits. L'objectif n'est pas uniquement esthétique, mais d'assurer lisibilité, différenciation et continuité sur l'ensemble des points de contact.",
    badges: [
      'Direction artistique',
      'Identité de marque',
      'Charte graphique',
      'Systèmes visuels',
      'Déclinaison multi-supports',
    ],
  },
  {
    number: '003',
    title: "Workflows augmentés par l'IA",
    description:
      "Intégrer l'IA comme un outil au service de la réflexion, et non comme une finalité. Elle intervient pour accélérer l'exploration, structurer les idées, identifier des patterns ou challenger des hypothèses, tout en laissant la prise de décision ancrée dans une logique humaine et contextualisée.",
    badges: [
      'Outils assistés par IA',
      "Aide à la structuration et à l'exploration",
      'Détection de patterns',
      'Support à la réflexion et à la décision',
      'Interaction humain–IA',
    ],
  },
  {
    number: '004',
    title: 'Design Systems & Ops',
    description:
      'Mettre en place les fondations qui rendent le design fiable et reproductible. Bibliothèques de composants, architecture de tokens, modèles de gouvernance — des éléments structurants qui optimisent durablement les processus.',
    badges: [
      'Architecture de composants',
      'Design tokens',
      'Gouvernance',
      'Modèles de contribution',
      'Organisation des équipes',
      'Documentation',
    ],
  },
  {
    number: '005',
    title: 'Recherche & Stratégie',
    description:
      "Prendre des décisions basées sur des données et des observations, plutôt que sur l'intuition. Transformer des signaux qualitatifs et quantitatifs en orientations exploitables.",
    badges: [
      'Recherche utilisateur',
      'Synthèse',
      "Architecture de l'information",
      'Stratégie produit',
      'Décisions pilotées par la donnée',
      'Alignement des parties prenantes',
    ],
  },
];

export const principlesFr: IndexItem[] = [
  {
    number: '001',
    title: 'Moins, mais mieux',
    description:
      "Éliminer le superflu pour ne conserver que l'essentiel. Chaque élément doit être justifié par sa fonction, pas par son apparence.",
  },
  {
    number: '002',
    title: "Priorité à l'usage",
    description:
      "Les décisions partent de situations réelles et de besoins concrets. L'empathie n'est pas une étape, c'est un socle.",
  },
  {
    number: '003',
    title: 'Efficacité structurée',
    description:
      "S'appuyer sur des systèmes scalables, des composants réutilisables et de l'automatisation lorsque c'est pertinent. L'efficacité traduit une bonne utilisation des ressources, pas un raccourci.",
  },
  {
    number: '004',
    title: 'Clarté dans les échanges',
    description:
      "Un design pertinent doit pouvoir être expliqué. La qualité du raisonnement et sa transmission sont aussi importantes que l'exécution visuelle.",
  },
];

export const rechercheFr: IndexItem[] = [
  {
    number: '001',
    title: 'Impact plutôt que production',
    description:
      'Je cherche à travailler sur des sujets qui comptent réellement. Des équipes où les décisions design répondent à de vrais problèmes et sont évaluées sur des résultats concrets, pas sur un volume de livrables.',
  },
  {
    number: '002',
    title: 'Collaboration réelle',
    description:
      "Un fonctionnement transverse où design, produit et technique avancent en partenaires, sur un pied d'égalité. Pas des passations, mais des échanges continus.",
  },
  {
    number: '003',
    title: 'Maturité design',
    description:
      "Des organisations qui considèrent le design comme un levier stratégique, intégré aux décisions, et non comme une simple couche d'exécution.",
  },
];

export const stringsFr: AproposStrings = {
  eyebrow: 'product & brand designer',
  accroche: 'Je conçois des produits qui tiennent debout sans moi.',
  whyLabel: '(pourquoi)',
  philosophieP1:
    "Un bon design doit fonctionner de manière autonome au sein de l'entreprise. L'objectif est de construire des solutions que les équipes peuvent s'approprier, maintenir et faire évoluer dans la durée, indépendamment des personnes qui les ont conçues. La plupart des problèmes ne sont pas visuels, ils sont structurels. Le design ne corrige pas une réflexion insuffisante sur ce que le produit doit réellement accomplir.",
  philosophieP2:
    "Le design doit s'effacer au profit de l'usage. Il anticipe les réalités internes : évolution des priorités, contraintes budgétaires, changements d'organisation. S'il dépend en permanence d'un soutien externe ou d'un expert pour fonctionner, alors il n'est pas robuste. Un design pertinent est celui qui s'intègre durablement dans les processus et continue de produire de la valeur sans dépendance.",
  expertiseLabel: '(ce que je sais faire)',
  expertiseTitle: 'Ce que je sais faire',
  principesLabel: '(ce qui me guide)',
  principesTitle: 'Ce qui guide mon travail',
  rechercheLabel: '(ce que je cherche)',
  rechercheTitle: 'Ce que je recherche',
  cvButton: 'Voir le Curriculum Vitae',
  cvSoon: 'bientôt',
};

// ── EN ──────────────────────────────────────────────────────────
export const expertisesEn: ExpertiseItem[] = [
  {
    number: '001',
    title: 'UX & Product Design',
    description:
      'Turning fuzzy problems into clear, structured interfaces. Involvement across the whole product cycle, from the discovery phase to finalised interactions, with constant attention to real-world usage.',
    badges: [
      'End-to-end product design',
      'Complex workflows',
      'Multi-platform',
      'Interaction design',
      'Prototyping',
      'User journeys',
    ],
  },
  {
    number: '002',
    title: 'Brand & Visual Design',
    description:
      'Building and evolving consistent visual identities, designed to fit within product environments. The goal is not purely aesthetic, but to ensure readability, differentiation and continuity across every touchpoint.',
    badges: [
      'Art direction',
      'Brand identity',
      'Brand guidelines',
      'Visual systems',
      'Multi-medium adaptation',
    ],
  },
  {
    number: '003',
    title: 'AI-augmented workflows',
    description:
      'Bringing AI in as a tool that serves thinking, not as an end in itself. It helps speed up exploration, structure ideas, spot patterns or challenge assumptions, while keeping decision-making grounded in human, contextual reasoning.',
    badges: [
      'AI-assisted tools',
      'Support for structuring and exploration',
      'Pattern detection',
      'Support for reasoning and decisions',
      'Human–AI interaction',
    ],
  },
  {
    number: '004',
    title: 'Design Systems & Ops',
    description:
      'Putting in place the foundations that make design reliable and repeatable. Component libraries, token architecture, governance models — structuring elements that improve processes over the long term.',
    badges: [
      'Component architecture',
      'Design tokens',
      'Governance',
      'Contribution models',
      'Team organisation',
      'Documentation',
    ],
  },
  {
    number: '005',
    title: 'Research & Strategy',
    description:
      'Making decisions based on data and observation rather than intuition. Turning qualitative and quantitative signals into actionable direction.',
    badges: [
      'User research',
      'Synthesis',
      'Information architecture',
      'Product strategy',
      'Data-driven decisions',
      'Stakeholder alignment',
    ],
  },
];

export const principlesEn: IndexItem[] = [
  {
    number: '001',
    title: 'Less, but better',
    description:
      'Cutting the superfluous to keep only the essential. Every element must be justified by its function, not its appearance.',
  },
  {
    number: '002',
    title: 'Usage first',
    description:
      'Decisions start from real situations and concrete needs. Empathy is not a step, it is a foundation.',
  },
  {
    number: '003',
    title: 'Structured efficiency',
    description:
      'Relying on scalable systems, reusable components and automation where relevant. Efficiency reflects a good use of resources, not a shortcut.',
  },
  {
    number: '004',
    title: 'Clarity in exchanges',
    description:
      'Relevant design must be explainable. The quality of the reasoning and how it is conveyed matter as much as the visual execution.',
  },
];

export const rechercheEn: IndexItem[] = [
  {
    number: '001',
    title: 'Impact over output',
    description:
      'I seek to work on things that genuinely matter. Teams where design decisions address real problems and are measured on concrete outcomes, not on a volume of deliverables.',
  },
  {
    number: '002',
    title: 'Real collaboration',
    description:
      'A cross-functional way of working where design, product and engineering move forward as equal partners. Not handoffs, but continuous exchange.',
  },
  {
    number: '003',
    title: 'Design maturity',
    description:
      'Organisations that treat design as a strategic lever, embedded in decisions, rather than a mere execution layer.',
  },
];

export const stringsEn: AproposStrings = {
  eyebrow: 'product & brand designer',
  accroche: 'I design products that stand on their own without me.',
  whyLabel: '(why)',
  philosophieP1:
    'Good design should work on its own within the company. The goal is to build solutions that teams can own, maintain and evolve over time, independently of the people who designed them. Most problems are not visual, they are structural. Design does not fix insufficient thinking about what the product should actually achieve.',
  philosophieP2:
    'Design should step back in favour of usage. It anticipates internal realities: shifting priorities, budget constraints, organisational change. If it constantly depends on external support or an expert to function, then it is not robust. Relevant design is the kind that integrates durably into processes and keeps producing value without dependency.',
  expertiseLabel: '(what I do)',
  expertiseTitle: 'What I do',
  principesLabel: '(what guides me)',
  principesTitle: 'What guides my work',
  rechercheLabel: "(what I'm after)",
  rechercheTitle: "What I'm looking for",
  cvButton: 'View resume',
  cvSoon: 'soon',
};

export function getAproposContent(lang: 'fr' | 'en') {
  const fr = lang === 'fr';
  return {
    strings: fr ? stringsFr : stringsEn,
    expertises: fr ? expertisesFr : expertisesEn,
    principles: fr ? principlesFr : principlesEn,
    recherche: fr ? rechercheFr : rechercheEn,
  };
}
```

- [ ] **Step 4: Lancer le test — il passe**

Run: `npx vitest run src/app/pages/APropos.content.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/APropos.content.ts src/app/pages/APropos.content.test.ts
git commit -m "feat(apropos): module de contenu bilingue (recherche condensé à 3)"
```

---

## Task 2: Police Bricolage + réécriture de la page

**Files:**
- Modify: `src/styles/fonts.css`
- Modify: `package.json` (dépendance)
- Modify: `src/app/pages/APropos.tsx` (réécriture complète)
- Test: `src/app/pages/APropos.test.tsx`

**Interfaces:**
- Consumes (Task 1) : `getAproposContent(lang)` → `{ strings, expertises, principles, recherche }` ; types `ExpertiseItem`, `IndexItem`, `AproposStrings`.
- Produces : composant `APropos` (default export) — page complète.

- [ ] **Step 1: Installer la police**

Run: `npm install @fontsource/bricolage-grotesque`
(Si indisponible, fallback : `npm install @fontsource/archivo` et importer Archivo 700/800 à la place, en gardant le nom de variable `--font-manifeste`.)

- [ ] **Step 2: Importer la police + variable dans `fonts.css`**

Dans `src/styles/fonts.css`, après les imports Playfair, ajouter :

```css
/* Bricolage Grotesque — accroche « manifeste » (self-hosted @fontsource) */
@import '@fontsource/bricolage-grotesque/700.css';
@import '@fontsource/bricolage-grotesque/800.css';
```

Et dans le bloc `:root { … }` de ce fichier, ajouter la variable :

```css
  --font-manifeste: 'Bricolage Grotesque', 'Archivo', var(--font-sans);
```

- [ ] **Step 3: Écrire le test de page (qui échoue)**

Créer `src/app/pages/APropos.test.tsx`. `useLang` a un fallback FR → pas besoin de provider ; on enveloppe juste dans `MemoryRouter`.

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import APropos from './APropos';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/apropos']}>
      <APropos />
    </MemoryRouter>,
  );

it('affiche l’accroche manifeste en h1', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
    /tiennent debout sans moi/,
  );
});

it('rend les 5 expertises, 4 principes et 3 items recherche', () => {
  renderPage();
  for (const title of [
    'UX & Product Design',
    'Design Systems & Ops',
    'Moins, mais mieux',
    'Impact plutôt que production',
    'Collaboration réelle',
    'Maturité design',
  ]) {
    expect(screen.getByText(title)).toBeTruthy();
  }
  // Un item « recherche » retiré (parmi les 6 d'origine) est bien absent
  expect(screen.queryByText('Problématiques complexes')).toBeNull();
  expect(screen.queryByText('Culture centrée humain')).toBeNull();
});

it('affiche le bouton CV mais désactivé (bientôt)', () => {
  renderPage();
  const cv = screen.getByTestId('cv-button');
  expect(cv.getAttribute('aria-disabled')).toBe('true');
});

it('ne rend plus le menu sticky de navigation par section', () => {
  renderPage();
  expect(screen.queryByLabelText('Aller à la section Expertises')).toBeNull();
  expect(screen.queryByLabelText('Aller à la section Principes')).toBeNull();
});
```

- [ ] **Step 4: Lancer le test — il échoue**

Run: `npx vitest run src/app/pages/APropos.test.tsx`
Expected: FAIL (l'ancienne page n'a pas `cv-button`, a encore le scrollspy, pas de h1 avec l'accroche).

- [ ] **Step 5: Réécrire `APropos.tsx`**

Remplacer **tout** le contenu de `src/app/pages/APropos.tsx` par :

```tsx
import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import PageMeta from '../components/PageMeta';
import ContactFooter from '../components/ContactFooter';
import RollingText from '../components/RollingText';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import ScrollFadeIn from '../components/ScrollFadeIn';
import { ROUTES } from '../config';
import { ROUTE_META } from '../config/seo';
import { useLang } from '../i18n';
import {
  getAproposContent,
  type ExpertiseItem,
  type IndexItem,
} from './APropos.content';

const CONTAINER =
  'mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24';

const LABEL_STYLE = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 500,
  fontSize: '13px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--portfolio-text-muted)',
};

const SECTION_TITLE_STYLE = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 600,
  fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
  lineHeight: 1.2,
  letterSpacing: '-0.03em',
  color: 'var(--portfolio-text-primary)',
} as const;

// Une ligne d'index : numéro | (titre + description [+ badges]).
function IndexRow({
  item,
  badges,
}: {
  item: ExpertiseItem | IndexItem;
  badges?: string[];
}) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-12 py-8"
      style={{ borderTop: '1px solid var(--portfolio-card-border)' }}
    >
      <div className="lg:col-span-4 flex items-baseline gap-4">
        <span
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--portfolio-text-muted)',
          }}
        >
          {item.number}
        </span>
        <h3
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(1.25rem, 1rem + 0.9vw, 1.9rem)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--portfolio-text-primary)',
          }}
        >
          {item.title}
        </h3>
      </div>
      <div className="lg:col-span-8">
        <p
          className="text-[15px]"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--portfolio-text-description)',
          }}
        >
          {item.description}
        </p>
        {badges && badges.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-[3px] px-[8px] py-[2px]"
                style={{
                  backgroundColor: 'var(--portfolio-badge-bg)',
                  border: '1px solid var(--portfolio-badge-border)',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '13px',
                  fontWeight: 400,
                  lineHeight: '18px',
                  color: 'var(--portfolio-text-muted)',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Un sous-bloc « index » : label + titre + lignes.
function IndexSection({
  label,
  title,
  delay,
  children,
}: {
  label: string;
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-16 md:pb-24">
      <div className={CONTAINER}>
        <ScrollRevealTitle delay={delay}>
          <p className="mb-1" style={LABEL_STYLE}>
            {label}
          </p>
        </ScrollRevealTitle>
        <ScrollRevealTitle delay={delay + 0.05}>
          <h2 className="mb-8" style={SECTION_TITLE_STYLE}>
            {title}
          </h2>
        </ScrollRevealTitle>
        <ScrollFadeIn delay={delay + 0.1}>
          <div style={{ borderBottom: '1px solid var(--portfolio-card-border)' }}>
            {children}
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}

export default function APropos() {
  const { lang } = useLang();
  const { strings: t, expertises, principles, recherche } =
    getAproposContent(lang);
  const [cvHover, setCvHover] = useState(false);

  useEffect(() => {
    // Reset scroll au montage — body est l'élément scrollable.
    document.body.scrollTop = 0;
  }, []);

  return (
    <div
      className="relative min-h-screen apropos-page"
      style={{ backgroundColor: 'var(--portfolio-bg)' }}
    >
      <PageMeta {...ROUTE_META[ROUTES.APROPOS]} />

      {/* 1. HERO MANIFESTE */}
      <section
        style={{ paddingTop: 'var(--page-padding-top)' }}
        className="pb-16 md:pb-24"
      >
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 lg:items-end">
            <div className="lg:col-span-8">
              <ScrollRevealTitle delay={0}>
                <p className="mb-4" style={LABEL_STYLE}>
                  {t.eyebrow}
                </p>
              </ScrollRevealTitle>
              <ScrollRevealTitle delay={0.05}>
                <h1
                  style={{
                    fontFamily: 'var(--font-manifeste)',
                    fontWeight: 800,
                    fontSize: 'clamp(2.5rem, 1rem + 8vw, 6rem)',
                    lineHeight: 0.98,
                    letterSpacing: '-0.03em',
                    textWrap: 'balance',
                    color: 'var(--portfolio-text-primary)',
                  }}
                >
                  {t.accroche}
                </h1>
              </ScrollRevealTitle>
            </div>

            {/* Portrait — placeholder cadré 4:5 (image fournie plus tard) */}
            <div className="lg:col-span-4">
              <ScrollFadeIn delay={0.1}>
                <div
                  aria-hidden="true"
                  className="flex items-end p-4"
                  style={{
                    aspectRatio: '4 / 5',
                    backgroundColor: 'var(--portfolio-card-bg)',
                    border: '1px solid var(--portfolio-card-border)',
                    borderRadius: '12px',
                  }}
                >
                  <span style={LABEL_STYLE}>portrait</span>
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LE POURQUOI — philosophie en exergue */}
      <section className="pb-16 md:pb-24">
        <div className={CONTAINER}>
          <ScrollRevealTitle delay={0}>
            <p className="mb-6" style={LABEL_STYLE}>
              {t.whyLabel}
            </p>
          </ScrollRevealTitle>
          <ScrollFadeIn delay={0.05}>
            <div style={{ maxWidth: '62ch' }}>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1.25rem, 1.05rem + 0.9vw, 1.9rem)',
                  lineHeight: 1.45,
                  letterSpacing: '-0.01em',
                  color: 'var(--portfolio-text-primary)',
                }}
              >
                {t.philosophieP1}
              </p>
              <p
                className="mt-8 text-[15px] md:text-base"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.7,
                  color: 'var(--portfolio-text-description)',
                }}
              >
                {t.philosophieP2}
              </p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* 3. LE COMMENT — index */}
      <IndexSection label={t.expertiseLabel} title={t.expertiseTitle} delay={0}>
        {expertises.map((item) => (
          <IndexRow key={item.number} item={item} badges={item.badges} />
        ))}
      </IndexSection>

      <IndexSection label={t.principesLabel} title={t.principesTitle} delay={0}>
        {principles.map((item) => (
          <IndexRow key={item.number} item={item} />
        ))}
      </IndexSection>

      <IndexSection label={t.rechercheLabel} title={t.rechercheTitle} delay={0}>
        {recherche.map((item) => (
          <IndexRow key={item.number} item={item} />
        ))}
      </IndexSection>

      {/* 4. CV — désactivé tant que /cv n'existe pas */}
      <section className="pb-20 md:pb-28">
        <div className={CONTAINER}>
          <div
            data-testid="cv-button"
            aria-disabled="true"
            className="inline-flex items-center gap-2 px-6 py-3 select-none"
            style={{
              backgroundColor: 'var(--portfolio-button-bg)',
              color: 'var(--portfolio-button-text)',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '5px',
              opacity: 0.55,
              cursor: 'not-allowed',
            }}
            onMouseEnter={() => setCvHover(true)}
            onMouseLeave={() => setCvHover(false)}
          >
            {/* TODO(cv): remplacer par <Link to="/cv"> une fois la page CV créée */}
            <FileText size={18} />
            <RollingText
              text={t.cvButton}
              inView={cvHover}
              transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }}
            />
            <span
              className="ml-1"
              style={{
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.8,
              }}
            >
              · {t.cvSoon}
            </span>
          </div>
        </div>
      </section>

      <ContactFooter />
    </div>
  );
}
```

- [ ] **Step 6: Lancer le test de page — il passe**

Run: `npx vitest run src/app/pages/APropos.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 7: Vérifier les gates globaux**

Run: `npx tsc --noEmit` → clean.
Run: `npx biome check --write src/app/pages/APropos.tsx src/app/pages/APropos.content.ts src/app/pages/APropos.content.test.ts src/app/pages/APropos.test.tsx src/styles/fonts.css` puis `npx biome check` sur ces fichiers → pas de nouvelle erreur (le baseline warn existant reste toléré).
Run: `npx vitest run` → toute la suite verte.
Run: `npm run build` → OK.
Run: `npm run budget` → ✅ ≤ 190 kB gzip.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(apropos): refonte « manifeste + index » (accroche Bricolage, corps index monochrome, CV bientôt)"
```

---

## Self-Review

**1. Couverture spec :**
- Structure (hero manifeste, pourquoi, index ×3, CV, footer) → Task 2 ✅
- Parcours/formation absents (renvoyés au CV) → aucun contenu parcours dans le module ✅
- Blocs conservés + recherche condensé à 3 → Task 1 (data) + Task 2 (rendu) ✅
- Accroche Bricolage Grotesque → Task 2 steps 1-2 + `--font-manifeste` sur le h1 ✅
- Monochrome / theme-aware → tokens `--portfolio-*` uniquement ✅
- Portrait placeholder 4:5 → Task 2 hero ✅
- Bouton CV « bientôt », pas de lien mort → Task 2 (aria-disabled, pas de navigation, TODO) ✅
- Menu sticky supprimé → réécriture sans `useScrollSpy`/boutons ✅
- Tests (accroche, comptes 5/4/3, item retiré absent, CV désactivé, plus de scrollspy, parité FR/EN) → Task 1 + Task 2 ✅
- Budget / gates → Task 2 step 7 ✅

**2. Placeholders :** aucun « TBD/à compléter » ; le seul `TODO(cv)` est un marqueur volontaire (futur `/cv`), pas une lacune du plan.

**3. Cohérence des types :** `getAproposContent(lang)` renvoie `{ strings, expertises, principles, recherche }` (Task 1) — consommé tel quel en Task 2. `ExpertiseItem` (avec `badges`) pour expertises, `IndexItem` (sans badges) pour principes/recherche. `IndexRow` accepte `ExpertiseItem | IndexItem` + `badges?` optionnel — cohérent. Variable `--font-manifeste` définie en Task 2 step 2, utilisée au step 5.
