export type ProjetCategory = 'mobile' | 'web' | 'branding';
export type FilterValue = 'all' | ProjetCategory;

export function filterProjets<T extends { category: string }>(
  projets: T[],
  filter: FilterValue,
): T[] {
  if (filter === 'all') return projets;
  return projets.filter((p) => p.category === filter);
}
