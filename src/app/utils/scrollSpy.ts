export interface SectionTop<K extends string> {
  key: K;
  top: number;
}

/**
 * Détermine la section active à partir d'une position de défilement.
 *
 * Les deux pages qui utilisent le scroll-spy (détail projet, à propos)
 * appliquent la même règle, exprimée dans un sens ou l'autre : la section
 * active est la **dernière** (la plus bas dans le document) dont le haut est
 * déjà passé sous la position de défilement ; `null` si aucune.
 *
 * @param sections Sections dans l'ordre du document (tops croissants).
 * @param scrollPosition Position de défilement (déjà décalée de l'offset).
 */
export function resolveActiveSection<K extends string>(
  sections: SectionTop<K>[],
  scrollPosition: number,
): K | null {
  let active: K | null = null;
  for (const section of sections) {
    if (scrollPosition >= section.top) {
      active = section.key;
    }
  }
  return active;
}
