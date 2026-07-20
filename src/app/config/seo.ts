import { ROUTES } from './routes';

/**
 * Métadonnées de référencement et de partage social — partie STATIQUE.
 *
 * Ce module ne dépend PAS de projetsData, pour que les pages chargées au
 * premier rendu (Home) puissent lire leurs meta sans tirer tout le contenu
 * des projets dans le bundle d'entrée. Les meta dérivées des projets vivent
 * dans seoRoutes.ts (importé seulement par les pages lazy et le build).
 */
export const SITE = {
  baseUrl: 'https://alexiskabiche.com',
  name: 'Alexis Kabiche',
  defaultDescription:
    "Portfolio d'Alexis Kabiche, Product & Brand Designer. Projets UX/UI, design d'applications métier et identité de marque.",
  ogImagePath: '/og-image.png',
  locale: 'fr_FR',
} as const;

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
}

/** Métadonnées des routes statiques, indexées par chemin. */
export const ROUTE_META = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    title: 'Alexis Kabiche — Product & Brand Designer',
    description: SITE.defaultDescription,
  },
  [ROUTES.PROJETS]: {
    path: ROUTES.PROJETS,
    title: 'Projets — Alexis Kabiche',
    description:
      "Tous les projets UX/UI d'Alexis Kabiche : applications métier, refontes, design systems et identité de marque.",
  },
  [ROUTES.APROPOS]: {
    path: ROUTES.APROPOS,
    title: 'À propos — Alexis Kabiche',
    description:
      "Parcours, expertises et principes de travail d'Alexis Kabiche, Product & Brand Designer.",
  },
  [ROUTES.CONTACT]: {
    path: ROUTES.CONTACT,
    title: 'Contact — Alexis Kabiche',
    description:
      'Contactez Alexis Kabiche, Product & Brand Designer à Paris, pour un projet, une mission ou une collaboration.',
  },
  [ROUTES.MENTIONS]: {
    path: ROUTES.MENTIONS,
    title: 'Mentions légales — Alexis Kabiche',
    description:
      "Mentions légales du site portfolio d'Alexis Kabiche : éditeur, hébergeur, propriété intellectuelle et protection des données personnelles.",
  },
} satisfies Record<string, RouteMeta>;

export const STATIC_ROUTE_META: RouteMeta[] = Object.values(ROUTE_META);
