import { describe, expect, it } from 'vitest';
import { projetsData } from '../data/projetsData';
import { ROUTES } from './routes';
import {
  getAllRouteMeta,
  getRouteMeta,
  ROUTE_META,
  SITE,
  STATIC_ROUTE_META,
} from './seo';

describe('métadonnées SEO', () => {
  it('couvre chaque route statique avec un titre et une description', () => {
    for (const meta of STATIC_ROUTE_META) {
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
      expect(meta.path.startsWith('/')).toBe(true);
    }
  });

  it('dérive une entrée par projet, avec titre suffixé du nom du site', () => {
    const projectMetas = getAllRouteMeta().filter((m) =>
      m.path.startsWith('/projets/'),
    );
    expect(projectMetas).toHaveLength(projetsData.length);

    for (const projet of projetsData) {
      const meta = getRouteMeta(ROUTES.PROJET_DETAIL(projet.id));
      expect(meta).not.toBeNull();
      expect(meta?.title).toBe(`${projet.title} — ${SITE.name}`);
      expect(meta?.description).toBe(projet.description);
    }
  });

  it('produit des chemins uniques', () => {
    const paths = getAllRouteMeta().map((m) => m.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('expose les métadonnées de la home indexées par chemin', () => {
    expect(ROUTE_META[ROUTES.HOME].title).toContain('Alexis Kabiche');
    expect(getRouteMeta('/route-inexistante')).toBeNull();
  });
});
