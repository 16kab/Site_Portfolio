import { SITE_CONTACT } from '../config';

export const CV_NAME = 'Alexis Kabiche';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/alexis-kabiche/';

interface Bi {
  fr: string;
  en: string;
}

interface CvExperienceRaw {
  role: Bi;
  company: string;
  contract: Bi;
  period: Bi;
  bullets: { fr: string[]; en: string[] };
  tags: { fr: string[]; en: string[] };
}

interface CvEducationRaw {
  title: Bi;
  school: string;
  period: string;
}

const experiencesRaw: CvExperienceRaw[] = [
  {
    role: { fr: 'UX/UI Designer', en: 'UX/UI Designer' },
    company: 'SPVIE Assurances',
    contract: { fr: 'CDI', en: 'Permanent' },
    period: { fr: "Janvier 2024 — Aujourd'hui", en: 'January 2024 — Present' },
    bullets: {
      fr: [
        'Conception from scratch du CRM BigBroker et de LeadFactory ; refonte du parcours B2B2C (~15 étapes, devis → tarification → souscription → signature) et de l’Espace Assuré desktop & mobile.',
        'Mise en place d’un environnement de conception assisté par IA (Claude Code) connecté aux design systems des différentes marques du groupe : des pages complètes produites en quelques minutes, directement dans la bonne direction artistique.',
        'Acquisition & conversion : landing pages courtiers, tunnels orientés conversion, A/B testing et analyse comportementale (ContentSquare).',
        'Refonte de la charte graphique SPVIE — identité, système typographique et chromatique, déclinaisons produit et supports — et direction artistique du site Agir Pour Toutes.',
        'Design system multi-produits scalable, réorganisation des fichiers Figma et contribution à la roadmap UX/UI.',
      ],
      en: [
        'BigBroker CRM and LeadFactory designed from scratch; redesign of the B2B2C journey (~15 steps, quote → pricing → subscription → e-signature) and of the policyholder area (desktop & mobile).',
        'Set up an AI-assisted design environment (Claude Code) wired to the design systems of the group’s brands: full pages produced in minutes, already on the right art direction.',
        'Acquisition & conversion: broker landing pages, conversion-oriented funnels, A/B testing and behavioural analysis (ContentSquare).',
        'SPVIE brand guidelines redesign — identity, type and colour system, product and marketing applications — and art direction of the Agir Pour Toutes website.',
        'Scalable multi-product design system, Figma files reorganization and contribution to the UX/UI roadmap.',
      ],
    },
    tags: {
      fr: [
        'CRM UX',
        'B2B2C',
        'Design System',
        'Direction artistique',
        'Acquisition',
        'Workflows IA',
      ],
      en: [
        'CRM UX',
        'B2B2C',
        'Design System',
        'Art direction',
        'Acquisition',
        'AI workflows',
      ],
    },
  },
  {
    role: {
      fr: 'Consultant Digital / Chef de Projet',
      en: 'Digital Consultant / Project Manager',
    },
    company: 'SPVIE Assurances',
    contract: { fr: 'Consultant puis CDI', en: 'Consultant then permanent' },
    period: { fr: 'Juillet — Décembre 2023', en: 'July — December 2023' },
    bullets: {
      fr: [
        'Pilotage de projets digitaux transverses entre les équipes métier, produit et IT ; cadrage fonctionnel en amont de chaque chantier.',
        'Interface opérationnelle entre décideurs et équipes techniques ; identification des inefficacités process et mise en place d’outils adaptés.',
      ],
      en: [
        'Led cross-functional digital projects across business, product and IT teams; upstream functional scoping of each workstream.',
        'Operational bridge between decision-makers and technical teams; spotting process inefficiencies and rolling out suitable tools.',
      ],
    },
    tags: {
      fr: ['Gestion de projet', 'Cadrage', 'Coordination transverse'],
      en: ['Project management', 'Scoping', 'Cross-team coordination'],
    },
  },
  {
    role: { fr: 'Chargé de Communication', en: 'Communications Manager' },
    company: 'BPI Group / LHH',
    contract: { fr: 'Alternance', en: 'Apprenticeship' },
    period: {
      fr: 'Octobre 2020 — Octobre 2022',
      en: 'October 2020 — October 2022',
    },
    bullets: {
      fr: [
        'Refonte de l’identité visuelle et du site corporate dans un contexte de modernisation de marque.',
        'Structuration de l’arborescence et des contenus (logique UX), audit SEO et recommandations d’amélioration.',
      ],
      en: [
        'Rebrand of the visual identity and corporate website in a brand-modernization context.',
        'Site structure and content architecture (UX-driven), SEO audit and improvement recommendations.',
      ],
    },
    tags: {
      fr: ['Identité visuelle', "Architecture de l'info", 'SEO'],
      en: ['Visual identity', 'Information architecture', 'SEO'],
    },
  },
];

const educationRaw: CvEducationRaw[] = [
  {
    title: {
      fr: 'Mastère Direction Artistique — Manager de la Communication Numérique (RNCP niv. 7)',
      en: 'MA Art Direction — Digital Communication Manager (RNCP level 7)',
    },
    school: 'IIM Digital School',
    period: '2018 — 2022',
  },
  {
    title: {
      fr: "Baccalauréat Scientifique — spécialité Sciences de l'Ingénieur",
      en: 'Scientific Baccalaureate — Engineering Sciences',
    },
    school: "Lycée de l'Essouriau, Les Ulis",
    period: '2017',
  },
];

const skillsRaw: Bi[] = [
  { fr: 'UX & Product Design', en: 'UX & Product Design' },
  { fr: 'Brand & Visual Design', en: 'Brand & Visual Design' },
  { fr: 'Design Systems & Ops', en: 'Design Systems & Ops' },
  { fr: "Workflows augmentés par l'IA", en: 'AI-augmented workflows' },
  { fr: 'Recherche & Stratégie', en: 'Research & Strategy' },
];

const tools: string[] = [
  'Figma',
  'Illustrator',
  'Claude Code',
  'ContentSquare',
];

const languagesRaw: Bi[] = [
  { fr: 'Français — natif', en: 'French — native' },
  { fr: 'Anglais — professionnel', en: 'English — professional' },
];

const strings = {
  fr: {
    title: 'Product & Brand Designer',
    download: 'Télécharger le PDF',
    experience: 'Expérience',
    skills: 'Compétences',
    tools: 'Outils',
    education: 'Formation',
    languages: 'Langues',
  },
  en: {
    title: 'Product & Brand Designer',
    download: 'Download PDF',
    experience: 'Experience',
    skills: 'Skills',
    tools: 'Tools',
    education: 'Education',
    languages: 'Languages',
  },
} as const;

export interface CvExperience {
  role: string;
  company: string;
  contract: string;
  period: string;
  bullets: string[];
  tags: string[];
}

export interface CvEducation {
  title: string;
  school: string;
  period: string;
}

export interface CvContent {
  name: string;
  title: string;
  labels: {
    experience: string;
    skills: string;
    tools: string;
    education: string;
    languages: string;
  };
  download: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    site: string;
    linkedin: string;
  };
  experiences: CvExperience[];
  education: CvEducation[];
  skills: string[];
  tools: string[];
  languages: string[];
}

export function getCvContent(lang: 'fr' | 'en'): CvContent {
  const s = strings[lang];
  return {
    name: CV_NAME,
    title: s.title,
    labels: {
      experience: s.experience,
      skills: s.skills,
      tools: s.tools,
      education: s.education,
      languages: s.languages,
    },
    download: s.download,
    contact: {
      email: SITE_CONTACT.email,
      phone: SITE_CONTACT.phoneDisplay,
      location: SITE_CONTACT.location,
      site: 'alexiskabiche.com',
      linkedin: LINKEDIN_URL,
    },
    experiences: experiencesRaw.map((e) => ({
      role: e.role[lang],
      company: e.company,
      contract: e.contract[lang],
      period: e.period[lang],
      bullets: e.bullets[lang],
      tags: e.tags[lang],
    })),
    education: educationRaw.map((e) => ({
      title: e.title[lang],
      school: e.school,
      period: e.period,
    })),
    skills: skillsRaw.map((x) => x[lang]),
    tools,
    languages: languagesRaw.map((x) => x[lang]),
  };
}
