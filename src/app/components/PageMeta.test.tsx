import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import PageMeta from './PageMeta';

function addHeadTag(html: string) {
  document.head.insertAdjacentHTML('beforeend', html);
}

describe('PageMeta', () => {
  beforeEach(() => {
    addHeadTag('<meta name="description" content="initiale" />');
    addHeadTag('<link rel="canonical" href="https://alexiskabiche.com/" />');
    addHeadTag('<meta property="og:title" content="initiale" />');
    addHeadTag('<meta property="og:description" content="initiale" />');
    addHeadTag('<meta property="og:url" content="https://alexiskabiche.com/" />');
  });

  afterEach(() => {
    document.head
      .querySelectorAll('meta[name="description"], link[rel="canonical"], meta[property^="og:"]')
      .forEach((el) => el.remove());
    document.title = '';
  });

  it('met à jour le titre du document', () => {
    render(<PageMeta title="Projets — Alexis Kabiche" path="/projets" />);
    expect(document.title).toBe('Projets — Alexis Kabiche');
  });

  it('met à jour la description, la canonical et les balises Open Graph', () => {
    render(
      <PageMeta
        title="Contact — Alexis Kabiche"
        description="Une description de test."
        path="/contact"
      />,
    );

    expect(
      document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe('Une description de test.');
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('https://alexiskabiche.com/contact');
    expect(
      document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    ).toBe('Contact — Alexis Kabiche');
    expect(
      document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
    ).toBe('https://alexiskabiche.com/contact');
  });
});
