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
