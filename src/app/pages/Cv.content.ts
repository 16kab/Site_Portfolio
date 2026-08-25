import { SITE_CONTACT } from '../config';

export const CV_NAME = 'Alexis Kabiche';
// TODO(cv): renseigner l'URL du profil LinkedIn (rend le libellé cliquable).
export const LINKEDIN_URL = '';

interface Bi {
  fr: string;
  en: string;
}

interface CvExperienceRaw {
  role: Bi;
  company: string;
  contract: Bi;
  period: Bi;
  summary: Bi;
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
    summary: {
      fr: "Conception produit de bout en bout (CRM BigBroker, LeadFactory, parcours B2B2C ~15 étapes, Espace Assuré) et mise en place d'un design system multi-produits.",
      en: 'End-to-end product design (BigBroker CRM, LeadFactory, ~15-step B2B2C journey, policyholder area) and a multi-product design system.',
    },
    tags: {
      fr: ['CRM UX', 'B2B2C', 'Design System', 'Acquisition', 'A/B testing'],
      en: ['CRM UX', 'B2B2C', 'Design System', 'Acquisition', 'A/B testing'],
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
    summary: {
      fr: "Pilotage de projets digitaux transverses (métier, produit, IT), cadrage fonctionnel et mise en place d'outils.",
      en: 'Led cross-functional digital projects (business, product, IT), functional scoping and tooling.',
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
    summary: {
      fr: "Refonte de l'identité visuelle et du site corporate, architecture des contenus et audit SEO.",
      en: 'Rebrand of the visual identity and corporate website, content architecture and SEO audit.',
    },
    tags: {
      fr: ['Identité visuelle', "Architecture de l'info", 'SEO'],
      en: ['Visual identity', 'Information architecture', 'SEO'],
    },
  },
  {
    role: { fr: 'Graphiste', en: 'Graphic Designer' },
    company: 'ShopInCar',
    contract: { fr: 'Stage · 6 mois', en: 'Internship · 6 months' },
    period: { fr: '2020', en: '2020' },
    summary: {
      fr: "Refonte de la WebApp mobile et desktop, conception d'interfaces et de supports.",
      en: 'Redesign of the mobile & desktop web app, interfaces and assets.',
    },
    tags: {
      fr: ['UI', 'Responsive', 'Ergonomie'],
      en: ['UI', 'Responsive', 'Usability'],
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
    tagline: 'Je conçois des produits clairs, qui tiennent dans la durée.',
    download: 'Télécharger le PDF',
    experience: 'Expérience',
    skills: 'Compétences',
    tools: 'Outils',
    education: 'Formation',
    languages: 'Langues',
  },
  en: {
    title: 'Product & Brand Designer',
    tagline: 'I design clear products, built to last.',
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
  summary: string;
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
  tagline: string;
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
    tagline: s.tagline,
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
      summary: e.summary[lang],
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
