import { afterEach, describe, expect, it } from 'vitest';
import {
  getProjetsScroll,
  resolveInitialProjetsScroll,
  saveProjetsScroll,
} from './projetsScroll';

afterEach(() => saveProjetsScroll(0));

describe('mémoire de scroll de la liste des projets', () => {
  it('sauvegarde et relit la dernière position', () => {
    saveProjetsScroll(1200);
    expect(getProjetsScroll()).toBe(1200);
  });
});

describe('resolveInitialProjetsScroll', () => {
  it('utilise le snapshot quand il vient de la liste', () => {
    saveProjetsScroll(720);
    expect(
      resolveInitialProjetsScroll({ originPath: '/projets', scrollTop: 480 }),
    ).toBe(480);
  });

  it('utilise la mémoire quand le snapshot vient d’une page détail', () => {
    saveProjetsScroll(720);
    // Cas « projet → autre projet → liste » : le scrollTop du snapshot (0)
    // est celui de la page détail, pas de la liste.
    expect(
      resolveInitialProjetsScroll({
        originPath: '/projets/premier',
        scrollTop: 0,
      }),
    ).toBe(720);
  });

  it('utilise la mémoire quand il n’y a pas de snapshot', () => {
    saveProjetsScroll(720);
    expect(resolveInitialProjetsScroll(null)).toBe(720);
  });
});
