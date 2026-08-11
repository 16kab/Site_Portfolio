import { describe, expect, it } from 'vitest';
import { filterProjets } from './filterProjets';

const P = [
  { id: 'a', category: 'mobile' },
  { id: 'b', category: 'web' },
  { id: 'c', category: 'mobile' },
];

describe('filterProjets', () => {
  it('retourne tout pour "all"', () => {
    expect(filterProjets(P, 'all')).toHaveLength(3);
  });
  it('filtre par catégorie', () => {
    expect(filterProjets(P, 'mobile').map((p) => p.id)).toEqual(['a', 'c']);
    expect(filterProjets(P, 'web').map((p) => p.id)).toEqual(['b']);
  });
  it('préserve l\'ordre', () => {
    expect(filterProjets(P, 'mobile')[0].id).toBe('a');
  });
});
