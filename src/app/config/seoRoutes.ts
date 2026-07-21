import { projetsData } from '../data/projetsData';
import { ROUTES } from './routes';
import { SITE, STATIC_ROUTE_META, type RouteMeta } from './seo';

/**
 * Métadonnées de référencement DÉRIVÉES des projets (+ agrégation avec les
 * routes statiques). Importe projetsData → à ne consommer que depuis les
 * pages lazy (Projets, ProjetDetail) et le build (prérendu / tests), jamais
 * depuis une page du bundle d'entrée. Voir seo.ts pour la partie statique.
 */
export { SITE, type RouteMeta };

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
