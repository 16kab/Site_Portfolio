import { describe, expect, it } from 'vitest';
import { resolveActiveSection } from './scrollSpy';

describe('resolveActiveSection', () => {
  // Reproduit la détection de la page Détail projet (offset déjà appliqué)
  const detail = [
    { key: 'explanation' as const, top: 500 },
    { key: 'gallery' as const, top: 1500 },
  ];

  it('renvoie null au-dessus de la première section', () => {
    expect(resolveActiveSection(detail, 400)).toBeNull();
  });

  it('renvoie la section courante entre deux seuils', () => {
    expect(resolveActiveSection(detail, 600)).toBe('explanation');
  });

  it('renvoie la dernière section passée', () => {
    expect(resolveActiveSection(detail, 1600)).toBe('gallery');
  });

  it('bascule pile au seuil (>=)', () => {
    expect(resolveActiveSection(detail, 1500)).toBe('gallery');
  });

  // Reproduit la détection de la page À propos (trois sections)
  const apropos = [
    { key: 'expertises' as const, top: 300 },
    { key: 'principes' as const, top: 800 },
    { key: 'environnement' as const, top: 1400 },
  ];

  it('gère trois sections comme la page À propos', () => {
    expect(resolveActiveSection(apropos, 200)).toBeNull();
    expect(resolveActiveSection(apropos, 400)).toBe('expertises');
    expect(resolveActiveSection(apropos, 900)).toBe('principes');
    expect(resolveActiveSection(apropos, 1500)).toBe('environnement');
  });

  it('ignore les listes vides', () => {
    expect(resolveActiveSection([], 1000)).toBeNull();
  });
});
