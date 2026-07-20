import { projetsData } from '../data/projetsData';
import { ROUTES } from './routes';

/**
 * Source unique des métadonnées de référencement et de partage social.
 *
 * Consommée à la fois côté client (les pages passent ces valeurs à PageMeta)
 * et au build (scripts/prerender-meta.mjs génère un index.html par route avec
 * ces meta, pour que les robots de partage — LinkedIn, WhatsApp, Slack… —
 * qui n'exécutent pas le JS voient le bon titre/description).
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

/** Métadonnées dérivées des pages de détail projet. */
export function getProjectRouteMeta(): RouteMeta[] {
  return projetsData.map((projet) => ({
    path: ROUTES.PROJET_DETAIL(projet.id),
    title: `${projet.title} — ${SITE.name}`,
    description: projet.description,
  }));
}

/** Toutes les routes indexables (statiques + détails projet). */
export function getAllRouteMeta(): RouteMeta[] {
  return [...STATIC_ROUTE_META, ...getProjectRouteMeta()];
}

export function getRouteMeta(path: string): RouteMeta | null {
  return getAllRouteMeta().find((meta) => meta.path === path) ?? null;
}
