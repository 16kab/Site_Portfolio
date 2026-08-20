import { describe, expect, it } from 'vitest';
import { projetsData, getTousProjets, tousProjets } from './projetsData';

const CATS = ['mobile', 'web', 'branding'] as const;
const EXPECTED: Record<string, (typeof CATS)[number]> = {
  mauni: 'mobile', trackit: 'mobile', 'mobile-cgrm': 'mobile',
  'onboarding-rh': 'web', 'refonte-spvie': 'web',
  'parcours-spvieassurances': 'web', 'crm-bigbroker': 'web',
  syma: 'branding', agpt: 'branding', 'charte-spvie': 'branding',
};

describe('projets — catégories & tailles', () => {
  it('chaque projet a une catégorie valide, conforme au mapping', () => {
    for (const p of projetsData) {
      expect(CATS).toContain(p.category);
      expect(p.category).toBe(EXPECTED[p.id]);
    }
  });
  it('tileSize, quand défini, est l/m/s', () => {
    for (const p of projetsData) {
      if (p.tileSize) expect(['l', 'm', 's']).toContain(p.tileSize);
    }
  });
  it('getTousProjets expose category et tileSize', () => {
    const list = getTousProjets('fr');
    expect(list).toHaveLength(projetsData.length);
    expect(CATS).toContain(list[0].category);
    expect(list[0]).toHaveProperty('tileSize');
  });
  it('chaque projet a un accent hex valide', () => {
    for (const p of tousProjets) {
      expect(p.accent, `accent manquant pour ${p.link}`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
