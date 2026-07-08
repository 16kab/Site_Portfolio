export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export const experiences: Experience[] = [
  {
    id: 'exp-1',
    company: 'Vertex Design Studio',
    role: 'Lead UX/UI Designer',
    period: '2023 - Present',
    description: 'Direction créative et stratégique sur des projets premium pour clients internationaux. Leadership d\'équipe et création de design systems.',
    achievements: [
      'Direction créative et stratégique de 8+ projets premium',
      'Mise en place d\'un design system adopté par 500+ équipes',
      'Management et mentoring d\'une équipe de 4 designers',
      'Augmentation moyenne de 67% des KPIs clients',
      'Speaker à UX Copenhagen et Awwwards Conference'
    ],
    technologies: ['Figma', 'React', 'TypeScript', 'Motion', 'WebGL', 'Design Systems']
  },
  {
    id: 'exp-2',
    company: 'Aurora Digital',
    role: 'Senior Product Designer',
    period: '2021 - 2023',
    description: 'Design de produits SaaS B2B complexes avec focus sur l\'UX research et les tests utilisateurs à grande échelle.',
    achievements: [
      'Refonte complète de 3 produits SaaS B2B générant $12M ARR',
      'Recherche utilisateur et tests avec 200+ participants',
      'Collaboration étroite avec Engineering et Product Management',
      'Création de motion design guidelines et animation library',
      'Réduction de 45% des support tickets via UX improvements'
    ],
    technologies: ['Figma', 'Vue.js', 'GSAP', 'After Effects', 'Analytics', 'A/B Testing']
  },
  {
    id: 'exp-3',
    company: 'Nexus Agency',
    role: 'UX/UI Designer',
    period: '2019 - 2021',
    description: 'Design d\'expériences digitales award-winning pour clients Fortune 500 dans divers secteurs.',
    achievements: [
      'Design de 15+ sites web et applications mobiles award-winning',
      'Collaboration avec clients Fortune 500 (finance, luxe, tech)',
      'Prototypage rapide et user testing',
      'Contribution au design system interne',
      '2x CSS Design Awards, 1x Awwwards Honorable Mention'
    ],
    technologies: ['Sketch', 'React', 'Tailwind', 'Framer', 'Principle', 'InVision']
  },
  {
    id: 'exp-4',
    company: 'Freelance',
    role: 'Creative Developer & Designer',
    period: '2017 - 2019',
    description: 'Création d\'expériences web interactives pour clients internationaux avec focus sur l\'animation et les interactions avancées.',
    achievements: [
      'Portfolio de 25+ projets web et mobile',
      'Spécialisation en animation et interaction design',
      'Clients internationaux (US, UK, France, Canada)',
      'Développement front-end React / Vue / WebGL',
      'Création de templates premium (2K+ ventes)'
    ],
    technologies: ['React', 'Three.js', 'GSAP', 'Canvas', 'WebGL', 'Node.js']
  }
];
