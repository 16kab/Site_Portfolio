/**
 * Application route configuration
 * Centralized route definitions for type-safe navigation
 */

export const ROUTES = {
  HOME: '/',
  PROJETS: '/projets',
  APROPOS: '/apropos',
  CONTACT: '/contact',
  /** Motif react-router pour la route de détail (définition de Route) */
  PROJET_DETAIL_PATTERN: '/projets/:id',
  /** Construit le chemin d'un projet donné (navigation) */
  PROJET_DETAIL: (id: string) => `/projets/${id}`,
} as const;

export type RouteKey = keyof typeof ROUTES;
