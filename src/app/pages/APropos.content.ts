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
}

// ── FR (canonique) ──────────────────────────────────────────────
export const expertisesFr: ExpertiseItem[] = [
  {
    number: '001',
    title: "Design augmenté par l'IA",
    description:
      "Un environnement de conception connecté aux design systems, capable de produire des pages complètes à la bonne direction artistique en quelques minutes. L'IA exécute ce qui est déjà tranché ; les arbitrages, eux, restent humains et contextualisés.",
    badges: [
      'Environnement de conception IA',
      'Design systems connectés',
      'Production à la marque',
      'Prototypage rapide',
      'Arbitrage humain',
    ],
  },
  {
    number: '002',
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
    number: '003',
    title: 'Brand & Direction artistique',
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
    number: '004',
    title: 'Design systems multi-marques',
    description:
      'Faire tenir plusieurs marques sur des fondations communes. Bibliothèques de composants, architecture de tokens, modèles de gouvernance — ce qui permet à une décision prise sur une marque de rester juste sur toutes les autres.',
    badges: [
      'Architecture de composants',
      'Design tokens',
      'Déclinaison multi-marques',
      'Gouvernance',
      'Modèles de contribution',
      'Documentation',
    ],
  },
  {
    number: '005',
    title: 'Culture métier & stratégie',
    description:
      "Comprendre le modèle économique, les contraintes réglementaires et les réseaux de distribution avant de dessiner. Transformer des signaux qualitatifs et quantitatifs en orientations exploitables, et ancrer la décision dans des données plutôt que dans l'intuition.",
    badges: [
      'Compréhension métier',
      'Recherche utilisateur',
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
      "S'appuyer sur des systèmes scalables, des composants réutilisables et sur l'IA lorsqu'elle fait gagner du temps sans coûter en justesse. L'efficacité traduit une bonne utilisation des ressources, pas un raccourci.",
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
      "Des organisations qui considèrent le design comme un levier stratégique, intégré aux décisions et pensé à l'échelle de toutes leurs marques, plutôt que comme une simple couche d'exécution.",
  },
];

export const stringsFr: AproposStrings = {
  eyebrow: 'product & brand designer',
  accroche: 'La cohérence est un travail, pas une intention.',
  whyLabel: '(pourquoi)',
  philosophieP1:
    "Un produit ne se conçoit pas isolément. Il hérite d'une marque, d'une organisation, de contraintes qui ne se voient pas à l'écran mais qui décident de tout. La plupart des problèmes ne sont pas visuels, ils sont structurels : ils viennent de ce qui n'a pas été tranché en amont, pas de ce qui a été mal dessiné.",
  philosophieP2:
    "Comprendre le métier avant de dessiner n'est pas une politesse, c'est la condition. Dans un parcours complexe, chaque étape existe pour une raison : une contrainte réglementaire, un modèle économique, un réseau de distribution. On ne simplifie pas en retirant des étapes, on simplifie en comprenant pourquoi elles existent. C'est la différence entre un écran plus joli et un produit qui fonctionne.",
  expertiseLabel: '(expertise)',
  expertiseTitle: 'Ce que je sais faire',
  principesLabel: '(principes)',
  principesTitle: 'Ce qui guide mon travail',
  rechercheLabel: '(ambition)',
  rechercheTitle: 'Ce que je recherche',
  cvButton: 'Voir le Curriculum Vitae',
};

// ── EN ──────────────────────────────────────────────────────────
export const expertisesEn: ExpertiseItem[] = [
  {
    number: '001',
    title: 'AI-augmented design',
    description:
      'A design environment wired to the design systems, able to produce full pages on the right art direction within minutes. AI executes what has already been settled; the judgment calls stay human and contextual.',
    badges: [
      'AI design environment',
      'Connected design systems',
      'On-brand production',
      'Rapid prototyping',
      'Human judgment',
    ],
  },
  {
    number: '002',
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
    number: '003',
    title: 'Brand & Art Direction',
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
    number: '004',
    title: 'Multi-brand design systems',
    description:
      'Holding several brands on shared foundations. Component libraries, token architecture, governance models — what lets a decision made on one brand stay right on all the others.',
    badges: [
      'Component architecture',
      'Design tokens',
      'Multi-brand theming',
      'Governance',
      'Contribution models',
      'Documentation',
    ],
  },
  {
    number: '005',
    title: 'Business insight & strategy',
    description:
      'Understanding the business model, the regulatory constraints and the distribution networks before drawing anything. Turning qualitative and quantitative signals into actionable direction, and grounding decisions in data rather than intuition.',
    badges: [
      'Business insight',
      'User research',
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
      'Relying on scalable systems, reusable components and on AI where it saves time without costing accuracy. Efficiency reflects a good use of resources, not a shortcut.',
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
      'Organisations that treat design as a strategic lever, embedded in decisions and thought through at the scale of all their brands, rather than a mere execution layer.',
  },
];

export const stringsEn: AproposStrings = {
  eyebrow: 'product & brand designer',
  accroche: 'Consistency is work, not intent.',
  whyLabel: '(why)',
  philosophieP1:
    'A product is never designed in isolation. It inherits a brand, an organisation, constraints that never show on screen yet decide everything. Most problems are not visual, they are structural: they come from what was never settled upstream, not from what was badly drawn.',
  philosophieP2:
    'Understanding the business before drawing is not a courtesy, it is the condition. In a complex journey, every step exists for a reason: a regulatory constraint, an economic model, a distribution network. You do not simplify by removing steps, you simplify by understanding why they are there. That is the difference between a nicer screen and a product that works.',
  expertiseLabel: '(expertise)',
  expertiseTitle: 'What I do',
  principesLabel: '(principles)',
  principesTitle: 'What guides my work',
  rechercheLabel: '(ambition)',
  rechercheTitle: "What I'm looking for",
  cvButton: 'View resume',
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
