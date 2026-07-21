import { describe, expect, it } from 'vitest';
import { getProjets, projetsData } from './projetsData';
import { projetsDataEn } from './projetsData.en';

describe('traductions des projets', () => {
  it('fournit une traduction EN pour chaque projet', () => {
    for (const projet of projetsData) {
      const en = projetsDataEn[projet.id];
      expect(en, `traduction manquante pour « ${projet.id} »`).toBeDefined();
      expect(en.title.length).toBeGreaterThan(0);
      expect(en.description.length).toBeGreaterThan(0);
      expect(en.tags.length).toBe(projet.tags.length);
    }
  });

  it('ne référence aucun id inconnu côté EN', () => {
    const ids = new Set(projetsData.map((p) => p.id));
    for (const id of Object.keys(projetsDataEn)) {
      expect(ids.has(id), `id EN orphelin : « ${id} »`).toBe(true);
    }
  });

  it('getProjets("fr") renvoie les données canoniques inchangées', () => {
    expect(getProjets('fr')).toBe(projetsData);
  });

  it('getProjets("en") applique les traductions', () => {
    const en = getProjets('en');
    const spvie = en.find((p) => p.id === 'parcours-spvieassurances');
    expect(spvie?.title).toBe('Redesign of the SPVIE subscription journey');
    // Les champs non textuels restent partagés
    const frSpvie = projetsData.find(
      (p) => p.id === 'parcours-spvieassurances',
    );
    expect(spvie?.image).toBe(frSpvie?.image);
    expect(spvie?.year).toBe(frSpvie?.year);
  });
});
