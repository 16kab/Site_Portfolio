/**
 * Application route configuration
 * Centralized route definitions for type-safe navigation
 */

export const ROUTES = {
  HOME: '/',
  CONTACT: '/contact',
  PROJETS: '/projets',
  PROJET_DETAIL: (id: string) => `/projets/${id}`,
} as const;

export type RouteKey = keyof typeof ROUTES;
