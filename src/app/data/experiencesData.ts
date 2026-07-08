// Experiences data - Professional experience and education history

export interface Experience {
  type: 'experience';
  poste: string;
  typeContrat: string;
  entreprise: string;
  lieu: string;
  periode: string;
  isActuel: boolean;
  description: string[];
  qualites: string[];
}

export interface Education {
  type: 'education';
  diplome: string;
  titreRNCP?: string;
  niveauRNCP?: string;
  specialite?: string;
  lieu: string;
  annee: string;
  isActuel: boolean;
  qualites: string[];
}

export type ExperienceItem = Experience | Education;

export const experiencesData: Experience[] = [
  {
    type: "experience",
    poste: "UX/UI Designer",
    typeContrat: "CDI",
    entreprise: "SPVIE Assurances",
    lieu: "France",
    periode: "Janvier 2024 – Aujourd'hui",
    isActuel: true,
    description: [
      "Conception & Structuration Produit",
      "Conception from scratch du CRM BigBroker : cadrage métier, structuration des workflows, design des interfaces",
      "Création complète de LeadFactory : de la réflexion UX à la logique de conversion",
      "Refonte stratégique du parcours B2B2C (devis → tarification → souscription → signature) sur ~15 étapes",
      "Refonte de l'Espace Assuré desktop & mobile avec harmonisation UX/UI",
      "Maquettes SaaS et interfaces full responsive sur l'ensemble des produits",
      "",
      "Acquisition & Performance",
      "Conception de landing pages dédiées aux campagnes d'acquisition courtiers",
      "Structuration de tunnels orientés conversion pour maximiser la génération de leads",
      "A/B testing sur les parcours stratégiques",
      "Analyse comportementale via ContentSquare pour prioriser les optimisations",
      "",
      "Gouvernance & Vision Produit",
      "Structuration progressive d'un design system multi-produits à logique scalable",
      "Réorganisation complète des fichiers Figma",
      "Contribution à la roadmap UX/UI et à la vision long terme de l'écosystème digital",
      "",
      "Branding & Direction Artistique",
      "Proposition de refonte stratégique de la charte graphique SPVIE",
      "Direction artistique et conception du site Agir Pour Toutes"
    ],
    qualites: [
      "B2B2C",
      "CRM UX",
      "Acquisition",
      "Conversion",
      "A/B Testing",
      "ContentSquare",
      "Design System",
      "Roadmap UX",
      "Transformation Digitale"
    ]
  },
  {
    type: "experience",
    poste: "Consultant Digital / Chef de Projet",
    typeContrat: "Consultant puis CDI",
    entreprise: "SPVIE Assurances",
    lieu: "France",
    periode: "Juillet 2023 – Décembre 2023",
    isActuel: false,
    description: [
      "Mission lancée en externe, intégrée en interne face à l'ampleur de la transformation",
      "Pilotage de projets digitaux transverses entre équipes métier, produit et IT",
      "Cadrage fonctionnel et structuration des besoins en amont de chaque chantier",
      "Interface opérationnelle entre les décideurs et les équipes techniques",
      "Identification des inefficacités process et mise en place d'outils adaptés"
    ],
    qualites: [
      "Gestion de projet",
      "Cadrage fonctionnel",
      "Coordination transverse",
      "Transformation digitale"
    ]
  },
  {
    type: "experience",
    poste: "Chargé de Communication",
    typeContrat: "Alternance",
    entreprise: "BPI Group / LHH",
    lieu: "France",
    periode: "Octobre 2020 – Octobre 2022",
    isActuel: false,
    description: [
      "Refonte de l'identité visuelle et du site corporate dans un contexte de modernisation de marque",
      "Structuration de l'arborescence et des contenus avec une logique d'expérience utilisateur",
      "Audit SEO et production de recommandations d'amélioration"
    ],
    qualites: [
      "UX thinking",
      "Architecture de l'information",
      "SEO",
      "Stratégie digitale"
    ]
  },
  {
    type: "experience",
    poste: "Graphiste",
    typeContrat: "Stage de 6 mois",
    entreprise: "ShopInCar",
    lieu: "France",
    periode: "2020",
    isActuel: false,
    description: [
      "Participation à la refonte de la WebApp mobile et desktop",
      "Conception d'interfaces et de supports digitaux"
    ],
    qualites: [
      "UI design",
      "Responsive",
      "Ergonomie"
    ]
  }
];

export const educationData: Education[] = [
  {
    type: "education",
    diplome: "Mastère Direction Artistique",
    titreRNCP: "Manager de la Communication Numérique",
    niveauRNCP: "Titre RNCP de niveau 7",
    lieu: "IIM Digital School",
    annee: "2018 - 2022",
    isActuel: false,
    qualites: []
  },
  {
    type: "education",
    diplome: "Baccalauréat Scientifique",
    specialite: "Sciences de l'Ingénieur",
    lieu: "Lycée de l'Essouriau, Les Ulis",
    annee: "2017",
    isActuel: false,
    qualites: []
  }
];